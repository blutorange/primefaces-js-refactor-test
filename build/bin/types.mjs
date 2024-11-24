/** @import { System } from "typescript" */
/** @import { TsConfigJson } from "type-fest" */

/** @import { FrontendProject } from "../common/find-frontend-projects.mjs"; */
/** @import { StringReplacement } from "../lang/string.mjs" */

import path from "node:path";
import fs from "node:fs/promises";
import { pipeline } from "node:stream/promises";

import {
    createSolutionBuilder,
    createSolutionBuilderHost,
    parseConfigFileTextToJson,
    sys,
} from "typescript";

import { findFrontendProjects } from "../common/find-frontend-projects.mjs";
import { DistDir, IsProduction, PackagesDir } from "../common/environment.mjs";
import { deleteIfExists, ensureDirectoryExists } from "../lang/file.mjs";
import { getAllCommentPragmasFromText } from "../common/comment-pragma.mjs";
import { applyStringReplacements } from "../lang/string.mjs";
import { allSettled } from "../lang/promise.mjs";
import { logError } from "../lang/error.mjs";

/**
 * @template K
 * @template V
 * @typedef {{
 * get(key: K): V | undefined;
 * has(key: K): boolean;
 * }} ReadonlyMapLike
 */
undefined;

/**
 * @typedef {(project: FrontendProject, tsConfigJson: TsConfigJson) => void} FrontendProjectTsConfigJsonModifier
 */
undefined;

/**
 * Reads a TypeScript configuration file and returns the parsed JSON.
 * Note that TypeScript uses an extended JSON format with comments,
 * so we can't just use `JSON.parse`.
 * @param {string} tsConfigPath Path to the tsconfig file.
 * @returns {Promise<TsConfigJson>} The parsed tsconfig.
 */
async function readTsConfigJson(tsConfigPath) {
    const jsonText = await fs.readFile(tsConfigPath, "utf8");
    const readResult = parseConfigFileTextToJson(tsConfigPath, jsonText);
    if (readResult.error) {
        throw new Error(`Failed to parse tsconfig file at <${tsConfigPath}>: ${readResult.error.messageText}`);
    }
    return readResult.config;
}

/**
 * Creates a TypeScript system that returns the given files when
 * requested, and delegates all other file operations to the
 * given system. This allows you to overwrite the contents of
 * certain files.
 * @param {System} sys Base TypeScript system to which to delegate,
 * @param {ReadonlyMapLike<string, Buffer>} fileOverrides Overrides for specific files.
 * @returns {System} A new TypeScript system.
 */
function createSystemWithFileOverrides(sys, fileOverrides) {
    /** @type {System} */
    const customSystem = Object.create(sys);
    customSystem.readFile = (path, encoding) => {
        const override = fileOverrides.get(path);
        return override
            ? override.toString(/** @type {BufferEncoding} */(encoding))
            : sys.readFile(path, encoding);
    };
    customSystem.writeFile = (path, data, writeByteOrderMark) => {
        if (fileOverrides.has(path)) {
            throw new Error(`Cannot write to virtual file <${path}>`);
        }
        sys.writeFile(path, data, writeByteOrderMark);
    };
    if (sys.getFileSize) {
        customSystem.getFileSize = (path) => {
            const virtualFile = fileOverrides.get(path);
            return virtualFile?.length ?? sys.getFileSize?.(path) ?? 0;
        };
    }
    return customSystem;
}

/**
 * Removes all reference comment pragmas from the given
 * TypeScript / JavaScript code that need to be at the
 * top of a source file and appends them to the given
 * pragma array.
 * 
 * Basically, removes all comments that look something
 * like `/// <reference ... />`.
 * 
 * @param {string} code The TypeScript / JavaScript code.
 * @param {string[]} pragmas The array to which the pragmas are appended.
 * @returns {string} The code with the reference pragmas removed.
 */
function extractAndRemoveTopCommentPragmas(code, pragmas) {
    const commentPragmas = getAllCommentPragmasFromText(code);
    /** @type {StringReplacement[]} */
    const replacements = [];
    for (const { comment: { start, end }, pragma } of commentPragmas) {
        if (pragma.type === "TripleSlashXML") {
            const source = code.substring(start, end);
            pragmas.push(source);
            replacements.push({ start, end, value: "" });
        }
    }
    return applyStringReplacements(code, replacements);
}

/**
 * Reads the TSConfig files of the given frontend projects, applies
 * the given modification function to each of them, and returns a
 * a map of the modified TSConfig files. The map key is the path to
 * the TSConfig file, and the map value is a {@link Buffer} with
 * the modified TSConfig file contents.
 * @param {FrontendProject[]} frontendProjects Frontend projects to process.
 * @param {FrontendProjectTsConfigJsonModifier} modifyTsConfig Function to modify the TSConfig.
 * @returns {Promise<Map<string, Buffer>>} A map of modified TSConfig files.
 */
async function createTsConfigOverrides(frontendProjects, modifyTsConfig) {
    const entries = frontendProjects.map(async project => {
        try {
            const tsConfigJson = await readTsConfigJson(project.tsConfig);
            modifyTsConfig(project, tsConfigJson);
            const newTsConfigJson = JSON.stringify(tsConfigJson, null, 2);
            return /** @type {const} */ ([project.tsConfig, Buffer.from(newTsConfigJson, "utf-8")]);
        } catch (e) {
            throw new Error(`Failed to read tsconfig file at <${project.tsConfig}>: ${e}`);
        }
    });
    const overrides = await allSettled(entries);
    return new Map(overrides);
}

/**
 * @param {FrontendProject[]} frontendProjects 
 * @param {FrontendProjectTsConfigJsonModifier} [tsConfigJsonModifier]
 */
async function runTypeScriptOnFrontendProjects(frontendProjects, tsConfigJsonModifier) {
    const rootNames = frontendProjects.map(project => project.tsConfig);
    const tsConfigOverrides = await createTsConfigOverrides(frontendProjects, tsConfigJsonModifier ?? (() => { }));

    const system = createSystemWithFileOverrides(sys, tsConfigOverrides);
    const host = createSolutionBuilderHost(system);
    const builder = createSolutionBuilder(host, rootNames, {
        force: IsProduction,
        verbose: false,
    });

    const exitStatus = builder.build();
    if (exitStatus !== 0) {
        throw new Error(`TypeScript failed with exit status ${exitStatus}`);
    }
}

/**
 * Runs TypeScript on the given frontend projects. Creates a
 * bundle type declaration file at `dist/index.d.ts` for each
 * project.
 * @param {FrontendProject[]} frontendProjects  Frontend projects to process.
 */
async function createBundledDeclarationFiles(frontendProjects) {
    // We want to set outFile to "index.d.ts" for all projects, so that
    // TypeScript produces a bundled type declaration file for each project.
    //
    // We can't set that directly in our tsconfig.json files, because that
    // precludes using other checks such a as `isolatedModules`
    // or `verbatimModuleSyntax`. These checks are useful for various
    // reasons, including performance and correctness when bundling
    // TypeScript code with ESBuild.
    //
    // So we need to use a custom tsconfig.json with a few adjusted options.
    await runTypeScriptOnFrontendProjects(frontendProjects, (project, tsConfigJson) => {
        // Set "outFile" to "index.d.ts" and disable options not compatible with "outFile"
        tsConfigJson.compilerOptions ??= {};
        delete tsConfigJson.compilerOptions.outDir;
        tsConfigJson.compilerOptions.rootDir = path.relative(project.root, PackagesDir);
        tsConfigJson.compilerOptions.outFile = path.join("dist", "index.d.ts");
        // @ts-expect-error New option introduced by TS 5.6, type-fest does not have it yet 
        tsConfigJson.compilerOptions.noCheck = true;
        tsConfigJson.compilerOptions.removeComments = false;
        tsConfigJson.compilerOptions.isolatedModules = false;
        tsConfigJson.compilerOptions.verbatimModuleSyntax = false;
    });
}

/**
 * Creates an `index.d.ts` file with the contents of all type
 * declaration files form the individual frontend projects.
 * @param {FrontendProject[]} frontendProjects 
 */
async function createMergedTypeDeclarationFile(frontendProjects) {
    const outPath = path.resolve(DistDir, "index.d.ts");
    const tempOutPath = path.resolve(DistDir, "index_temp.d.ts");
    try {
        // Collect all type declaration files that need to be merged
        const inPaths = frontendProjects.map(project => path.resolve(project.dist, "index.d.ts"));

        // Delete output files if they exist,and create
        // the output directory if it doesn't exist
        await deleteIfExists(outPath);
        await deleteIfExists(tempOutPath);
        await ensureDirectoryExists(DistDir);

        // Note: Triple slash comment pragmas such as `/// <reference ... />`
        // need to be moved to the top of the merged type declaration file.

        // Write the type declarations without comment pragmas to the temp file
        const tempOutFile = await fs.open(tempOutPath, "a");
        /** @type {string[]} */
        const commentPragmas = [];
        try {
            const modifiedDeclarations = await allSettled(inPaths.map(async inPath => {
                const content = await fs.readFile(inPath, "utf-8");
                return extractAndRemoveTopCommentPragmas(content, commentPragmas);
            }));
            for (const modifiedDeclaration of modifiedDeclarations) {
                await tempOutFile.appendFile(modifiedDeclaration, { encoding: "utf-8" });
            }
        } finally {
            await tempOutFile.close();
        }

        // Append the comment pragmas at the top of the out file,
        // then add the type declarations from the temp file
        const outFile = await fs.open(outPath, "a");
        try {
            const outWriteStream = outFile.createWriteStream();
            for (const pragma of commentPragmas) {
                await outFile.appendFile(pragma, { encoding: "utf-8" });
                await outFile.appendFile("\n", { encoding: "utf-8" });
            }
            const inFile = await fs.open(tempOutPath, "r");
            await pipeline(inFile.createReadStream(), outWriteStream, { end: false });
        } finally {
            await outFile.close();
        }
    } finally {
        await deleteIfExists(tempOutPath);
    }

    console.log(`Wrote merged type declaration file to <${outPath}>`);
}

/**
 * Runs TypeScript on all frontend projects. First, checks that
 * all projects compile successfully and that TypeScript produces
 * no errors and warning. Then, creates a bundled `dist/index.d.ts`
 * declarations file with the contents of all individual frontend
 * projects.
 */
async function main() {
    const t1 = Date.now();

    const frontendProjects = await findFrontendProjects();
    console.log(`Running TypeScript on ${frontendProjects.length} projects...`);

    const t2 = Date.now();
    await runTypeScriptOnFrontendProjects(frontendProjects);

    const t3 = Date.now();
    await createBundledDeclarationFiles(frontendProjects);

    const t4 = Date.now();
    await createMergedTypeDeclarationFile(frontendProjects);

    const t5 = Date.now();
    console.log(`Collected frontend projects in ${t2 - t1} ms`);
    console.log(`Checked types in ${t3 - t2} ms`);
    console.log(`Created bundled declaration files in ${t4 - t3} ms`);
    console.log(`Merged type declarations in ${t5 - t4} ms`);
}

main().catch(e => {
    console.error("Failed to run TypeScript on frontend projects. Check above for details.");
    logError(e);
    process.exit(1);
});
