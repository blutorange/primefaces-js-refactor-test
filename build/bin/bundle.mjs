/** @import { BuildOptions, BuildResult, Metafile } from "esbuild"; */
/** @import { FrontendProject } from "../common/find-frontend-projects.mjs"  */

import path from "node:path";
import fs from "node:fs/promises";

import * as esbuild from "esbuild";
import SourceMapCombiner from "fast-sourcemap-concat";
import { sys as tsSys, readConfigFile, parseJsonConfigFileContent } from "typescript";

import { getAllCommentPragmasFromFile } from "../common/comment-pragma.mjs";
import { logError } from "../common/error.mjs";
import { DistDir, IsProduction, RootDir } from "../common/environment.mjs";
import { deleteIfExists, ensureDirectoryExists, ensureFileExists, existsAndIsDirectory, existsAndIsFile, isInSubFolderOf } from "../common/file.mjs";
import { findFrontendProjects } from "../common/find-frontend-projects.mjs";
import { allSettled, allSettledTuple } from "../common/promise.mjs";

/**
 * @typedef {{
 * js: string;
 * jsLegal: string;
 * css: string;
 * cssLegal: string;
 * }} OutputFileGroup
 */
undefined;

/**
 * @type {Record<string, unknown>}
 */
const SourceMapCache = {};

const OutputFileGroup = /**@type{const}*/(["js", "css", "jsLegal", "cssLegal"]);

/**
 * @template {readonly unknown[] |readonly []} T
 * @template K
 * @template V
 * @param {T} values
 * @param {(value: T[number]) => readonly [K,V]} fn
 * @returns {Record<K,V>}
 */
function mapToRecord(values, fn) {
    return Object.fromEntries(values.map(fn));
}

/**
 * @template {string} K
 * @template V
 * @param {readonly K[]} keys
 * @param {V} initialValue
 * @returns {Record<K,V>}
 */
function createRecord(keys, initialValue) {
    return mapToRecord(keys, key => [key, initialValue]);
}

/**
 * @return {BuildOptions}
*/
function createEsBuildOptions() {
    return {
        absWorkingDir: RootDir,
        charset: "utf8",
        target: "es6",
        legalComments: "external",
        sourcemap: IsProduction ? false : "external",
        minify: IsProduction,
        logLevel: "error",
    }
}

/**
 * Finds all file paths included by the given `tsconfig.json` file.
 * Considers both the `files` and `include` fields in the `tsconfig.json`.
 * @param {string} filePath Path to tsconfig.json file
 * @returns All file paths included by the given tsconfig.json file
 */
function readTsConfigIncludes(filePath) {
    const tsconfigFile = readConfigFile(filePath, tsSys.readFile)
    // Resolve "extends" field in `tsconfig.json`
    const parsed = parseJsonConfigFileContent(
        tsconfigFile.config,
        tsSys,
        path.dirname(filePath)
    )
    return parsed.fileNames;
}

/**
 * Given a set of TypeScript or JavaScript files, reads all comment pragmas
 * of the form `/// <reference path="..." />` from the files. For each file,
 * returns a tuple with the file path and an array of paths referenced in
 * the comment pragmas.
 * 
 * All file paths are absolute and normalized.
 * @param {string[]} files List of file paths.
 * @returns {Promise<(readonly [string, readonly string[]])[]>} File paths and their dependencies.
 */
async function readCommentPragmaReferences(files) {
    return await allSettled(files
        .map(async file => {
            const filePath = path.normalize(path.resolve(file));
            const dirPath = path.dirname(filePath);
            const commentPragmas = await getAllCommentPragmasFromFile(filePath);
            const dependencies = commentPragmas
                .map(({ pragma }) => {
                    return pragma.type === "TripleSlashXML" && pragma.name === "reference" && pragma.args.path
                        ? path.normalize(path.resolve(dirPath, pragma.args.path))
                        : undefined;
                })
                .filter(filePath => filePath !== undefined);
            return /**@type{const}*/([filePath, dependencies]);
        }));
}

/**
 * Given a set of global script files (i.e. without import/export statements),
 * and their dependencies (specified in the source code via comment pragma,
 * /// <reference path="..." />), sorts the files by their dependencies.
 * 
 * Specifically, the files represent the nodes of a graph, and the
 * [file, dependency] the edges of that graph. The initial files from the
 * `tsconfig.json` are the root nodes. The order is then defined as a
 * post-order traversal of that graph.
 * 
 * See also
 * https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-path-
 * 
 * @param {string[]} initialFiles Initial files from the `tsconfig.json`.
 * @param {Map<string, readonly string[]>} dependenciesByPath Dependencies for each file.
 * @returns {string[]} Sorted list of files.
 */
function sortGlobalScriptFilesWithDependencies(initialFiles, dependenciesByPath) {
    /** @type {string[]} */
    const sortedEntries = [];

    /** @type {Set<string>} */
    const processed = new Set();

    /** @type {(files: readonly string[]) => void} */
    const process = (files) => {
        for (const file of files) {
            if (!processed.has(file)) {
                processed.add(file);
                const dependencies = dependenciesByPath.get(file) ?? [];
                process(dependencies);
                sortedEntries.push(file);
            }
        }
    };

    process(initialFiles);

    return sortedEntries;
}

/**
 * Finds all global script files specified by the given frontend project,
 * and returns them in the order they need to be processed. See
 * https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-path-
 * 
 * These are the files from the tsconfig.json `files` and `include` fields.
 * Files may use `/// <reference path="..." />` for including other files.
 * Such comment pragmas also defined the order in which files are processed.
 * 
 * Also, global script files are files without `import` or `export`
 * statements. All such files must be in the `script` sub directory of the project.
 * 
 * @param {FrontendProject} frontendProject A frontend project.
 * @returns {Promise<string[]>} All script files that need to be processed, in order.
 */
async function collectGlobalScriptFilesWithDependencies(frontendProject) {
    if (!existsAndIsDirectory(frontendProject.scriptRoot)) {
        return [];
    }

    /** @type {Map<string, readonly string[]>} */
    const dependenciesByPath = new Map();

    // Files may reference other files that are not present in the
    // list of files specified int the tsconfig.json. But we don't
    // want to process all files synchronously. Instead, process
    // files in batches, so we can process files in parallel.
    const initialFiles = readTsConfigIncludes(frontendProject.tsConfig)
        .filter(file => isInSubFolderOf(frontendProject.scriptRoot, file));
    let stack = [...initialFiles];
    while (stack.length > 0) {
        const scriptFileEntries = await readCommentPragmaReferences(stack);
        for (const [path, dependencies] of scriptFileEntries) {
            if (isInSubFolderOf(frontendProject.scriptRoot, path)) {
                dependenciesByPath.set(path, dependencies);
            }
        }
        // Check if any dependency is new, and if so, process them in the next loop iteration
        stack = scriptFileEntries.flatMap(e => e[1]).filter(d => !dependenciesByPath.has(d));
    }

    return sortGlobalScriptFilesWithDependencies(initialFiles, dependenciesByPath);
}

/**
 * 
 * @param {FrontendProject} project 
 * @param {string[]} globalScriptFiles 
 * @param {string} outputFile 
 * @param {string} tempScriptOutputDir 
 * @returns {Promise<{moduleResult: BuildResult | undefined, scriptResult: BuildResult | undefined }>}
 */
async function runFrontendBuildTasks(project, globalScriptFiles, outputFile, tempScriptOutputDir) {
    /** @type {BuildOptions[]} */
    const buildTasks = [];

    const hasGlobalScriptFiles = globalScriptFiles.length > 0;
    const hasModuleFile = await existsAndIsFile(project.index);

    if (hasModuleFile) {
        buildTasks.push({
            ...createEsBuildOptions(),
            entryPoints: [project.index],
            bundle: true,
            outfile: outputFile,
            metafile: true,
            write: true,
        });
    }

    if (hasGlobalScriptFiles) {
        buildTasks.push({
            ...createEsBuildOptions(),
            entryPoints: globalScriptFiles,
            bundle: false,
            outdir: tempScriptOutputDir,
            metafile: true,
            write: true,
        });
    }

    const buildResults = await allSettledTuple(buildTasks.map(task => esbuild.build(task)));
    const moduleResult = hasModuleFile ? buildResults.shift() : undefined;
    const scriptResult = hasGlobalScriptFiles ? buildResults.shift() : undefined;

    return { moduleResult, scriptResult };
}

/**
 * @param {BuildResult<BuildOptions>} buildResult
 * @returns {Partial<OutputFileGroup>[]}
 */
function groupOutputFiles(buildResult) {
    /** @type {Record<string, Partial<OutputFileGroup>>} */
    const grouped = {};

    for (const filePath of Object.keys(buildResult.metafile?.outputs ?? {})) {
        const absPath = path.normalize(path.resolve(RootDir, filePath));
        const relPath = path.relative(RootDir, absPath);

        /** @type {string | undefined} */
        let basePath = relPath;
        /** @type {keyof OutputFileGroup | undefined} */
        let type;
        if (relPath.endsWith(".js")) {
            type = "js";
            basePath = basePath.substring(0, basePath.length - ".js".length);
        } else if (basePath.endsWith(".css")) {
            type = "css";
            basePath = basePath.substring(0, basePath.length - ".css".length);
        } else if (basePath.endsWith(".txt")) {
            basePath = basePath.substring(0, basePath.length - ".LEGAL.txt".length);
            if (basePath.endsWith(".css")) {
                type = "cssLegal";
                basePath = basePath.substring(0, basePath.length - ".css".length);
            } else if (basePath.endsWith(".js")) {
                type = "jsLegal";
                basePath = basePath.substring(0, basePath.length - ".js".length);
            } else {
                type = undefined;
                basePath = undefined;
            }
        }

        if (type !== undefined && basePath !== undefined) {
            const entry = (grouped[basePath] ??= createRecord(OutputFileGroup, undefined));
            entry[type] = absPath;
        }
    }
    return Object.values(grouped);
}

/**
 * @param {keyof OutputFileGroup} type
 * @param {Record<keyof OutputFileGroup, Promise<void>>} pending
 * @param {Partial<OutputFileGroup>} file
 * @param {Record<keyof OutputFileGroup, fs.FileHandle | SourceMapCombiner | undefined>} handle 
 */
function appendFileWithSourceMap(type, pending, file, handle) {
    const typedFile = file[type];
    const typedHandle = handle[type];
    if (typedFile === undefined || typedHandle === undefined) {
        return;
    }
    pending[type] = pending[type].then(async () => {
        const content = await fs.readFile(typedFile, { encoding: "utf8" });
        if (typedHandle instanceof SourceMapCombiner) {
            const sourceMapFile = `${typedFile}.map`;
            if (content.length > 0) {
                const sourceMapContent = await fs.readFile(sourceMapFile, { encoding: "utf8" });
                typedHandle.addFileSource(typedFile, content, sourceMapContent);
            }
        } else if (typedHandle !== undefined) {
            await typedHandle.appendFile(content, { encoding: "utf8" });
        }
    });
}

/**
 * @param {Partial<OutputFileGroup>[]} grouped 
 * @param {Record<keyof OutputFileGroup, boolean>} hasOutput
 * @param {OutputFileGroup} outputFile
 * @param {OutputFileGroup} tempFile
 * @param {boolean} sourceMapsEnabled
 */
async function concatScriptOutputFiles(grouped, hasOutput, outputFile, tempFile, sourceMapsEnabled) {
    /** @type {AsyncDisposable[]} */
    const disposables = [];
    try {
        const handle = createRecord(OutputFileGroup, /** @type{fs.FileHandle | SourceMapCombiner | undefined}*/(undefined));
        for (const type of OutputFileGroup) {
            if (hasOutput[type]) {
                // If source map are are enabled, the source map combiner also takes care of writing the output file
                if (sourceMapsEnabled && (type === "js" || type === "css")) {
                    const sourceMap = handle[type] = new SourceMapCombiner({
                        cache: SourceMapCache,
                        mapStyle: "data",
                        outputFile: tempFile[type],
                    });
                    disposables.push({ [Symbol.asyncDispose]: async () => await sourceMap.end() });
                } else {
                    const fh = handle[type] = await fs.open(tempFile[type], "a");
                    disposables.push({ [Symbol.asyncDispose]: async () => await fh.close() });
                }
            }
        }

        const pending = mapToRecord(OutputFileGroup, type => [type, Promise.resolve()]);

        // Append the main files to the temp files
        const outputExists = await allSettled(OutputFileGroup.map(async type => await existsAndIsFile(outputFile[type]) ? type : undefined));
        outputExists.filter(x => x !== undefined).forEach(type => appendFileWithSourceMap(type, pending, outputFile, handle));

        // Append all additional JS, CSS, and legal files to the main files
        for (const file of grouped) {
            OutputFileGroup.forEach(type => appendFileWithSourceMap(type, pending, file, handle));
        }

        // Wait until all append operations are done
        await allSettled(Object.values(pending));
    } finally {
        await allSettled(disposables.map(d => d[Symbol.asyncDispose]()));
    }
}

/**
 * @param {string[]} scriptFiles List of input script files that were processed.
 * @param {BuildResult<BuildOptions>} buildResult Build result from ESBuild.
 * @param {OutputFileGroup} mainFile Path to the final JavaScript / CSS / legal output file in the dist directory.
 * @param {boolean} sourceMapsEnabled Whether source maps are enabled.
 */
async function mergeScriptOutput(scriptFiles, buildResult, mainFile, sourceMapsEnabled) {
    // Find output files, with corresponding JS/CSS/legal files grouped together
    const groupedOutputFiles = groupOutputFiles(buildResult);

    const scriptFileOrder = new Map(scriptFiles.map((file, index) => [file, index]));
    groupedOutputFiles.sort((a, b) => (scriptFileOrder.get(b.js ?? "") ?? -1) - (scriptFileOrder.get(a.js ?? "") ?? -1));

    const hasOutput = mapToRecord(OutputFileGroup, type => [type, groupedOutputFiles.some(file => file[type] !== undefined)]);
    const outputTypes = OutputFileGroup.filter(type => hasOutput[type]);

    const tempFile = mapToRecord(OutputFileGroup,
        type => [type, path.resolve(path.dirname(mainFile[type]), path.basename(mainFile[type]) + ".tmp")]);
    try {
        // Make sure temp files exist
        await allSettled(outputTypes.map(async type => {
            await deleteIfExists(tempFile[type]);
            await ensureDirectoryExists(path.dirname(tempFile[type]));
            await ensureFileExists(tempFile[type]);
        }));

        // Merge output from main module file with output from script files
        await concatScriptOutputFiles(groupedOutputFiles, hasOutput, mainFile, tempFile, sourceMapsEnabled);

        // Copy temp files to final files
        await allSettled(outputTypes.map(type => fs.copyFile(tempFile[type], mainFile[type])));
        await allSettled(outputTypes.map(async type => {
            const source = `${tempFile[type]}.map`;
            const target = `${mainFile[type]}.map`;
            if (await existsAndIsFile(source)) {
                await fs.copyFile(source, target);
            }
        }));
    } finally {
        // Delete temp files
        await allSettled(outputTypes.map(type => deleteIfExists(tempFile[type])));
        await allSettled(outputTypes.map(type => deleteIfExists(`${tempFile[type]}.map`)));
    }
}

/**
 * Merges all given meta files into a single meta file.
 * @param {(Metafile | undefined)[]} metaFiles 
 * @return {Metafile}
 */
function mergeMetaFiles(metaFiles) {
    /** @type {import("esbuild").Metafile} */
    const merged = { inputs: {}, outputs: {} };

    for (const metaFile of metaFiles) {
        if (metaFile === undefined) {
            continue;
        }
        for (const [key, input] of Object.entries(metaFile.inputs)) {
            // Same input produces same metadata, so we can just overwrite it if it exists already (or skip it, does not matter)
            merged.inputs[key] = input;
        }
        for (const [key, output] of Object.entries(metaFile.outputs)) {
            if (key in merged.outputs) {
                throw new Error(`Duplicate output file: ${key}`);
            }
            merged.outputs[key] = output;
        }
    }

    return merged;
}

/**
 * @param {FrontendProject} project
 * @returns {Promise<Metafile[]>}
 */
async function bundleFrontendProject(project) {
    const scriptFiles = await collectGlobalScriptFilesWithDependencies(project);

    const tempOutputDir = path.resolve(project.dist, "build_script");
    await deleteIfExists(tempOutputDir);
    await ensureDirectoryExists(tempOutputDir);

    const outputFile = {
        js: path.resolve(DistDir, `${project.name}.js`),
        css: path.resolve(DistDir, `${project.name}.css`),
        jsLegal: path.resolve(DistDir, `${project.name}.js.LEGAL.txt`),
        cssLegal: path.resolve(DistDir, `${project.name}.css.LEGAL.txt`),
    };

    await allSettled(Object.values(outputFile).map(file => deleteIfExists(file)));
    await allSettled(Object.values(outputFile).map(file => ensureDirectoryExists(path.dirname(file))));

    // Bundle the module/index.js module file and concat all files from the /script directory
    const { moduleResult, scriptResult } = await runFrontendBuildTasks(project, scriptFiles, outputFile.js, tempOutputDir);

    // Append the content of the "/script/*" files to the output file
    if (scriptResult !== undefined) {
        await mergeScriptOutput(scriptFiles, scriptResult, outputFile, !IsProduction);
    }

    // Remove the temporary script output directory
    await deleteIfExists(tempOutputDir);

    /** @type {Metafile[]} */
    const metaFiles = [];
    if (moduleResult !== undefined && moduleResult.metafile !== undefined) {
        metaFiles.push(moduleResult.metafile);
    }
    if (scriptResult !== undefined && scriptResult.metafile !== undefined) {
        metaFiles.push(scriptResult.metafile);
    }
    return metaFiles;
}

/**
 * Build script that invokes ESBuild on each individual frontend project.
 * 
 * Also writes a `dist/meta.json` file that contains the meta file output 
 * from ESBuild. You can use e.g. https://esbuild.github.io/analyze/
 * to visualize the bundle and its contents.
 */
async function main() {
    const t1 = Date.now();
    await ensureDirectoryExists(DistDir);

    const frontendProjects = await findFrontendProjects();
    const t2 = Date.now();

    const metaFiles = await allSettled(frontendProjects.map(project => bundleFrontendProject(project)));
    const t3 = Date.now();

    const metaFile = mergeMetaFiles(metaFiles.flatMap(f => f));
    const metaFilePath = path.resolve(DistDir, "meta.json");
    await fs.writeFile(metaFilePath, JSON.stringify(metaFile, null, 2), "utf8");
    const t4 = Date.now();

    console.log(`Found ${frontendProjects.length} frontend projects in ${t2 - t1}ms`);
    console.log(`Bundled ${frontendProjects.length} frontend projects in ${t3 - t2}ms`);
    console.log(`Merged meta file ${metaFilePath} in ${t4 - t3}ms`);
}

/**
 * @typedef {{
 * path: string;
 * dependencies: string[];
 * }} GlobalScriptFileDependencyEntry
 */
undefined;

main().catch(e => {
    console.error("Failed to create bundles");
    logError(e);
    process.exit(1);
});
