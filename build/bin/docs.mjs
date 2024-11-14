/** @import { TypeDocOptions } from "typedoc"; */
/** @import { FrontendProject} from "../common/find-package-paths.mjs" */

import { Application } from "typedoc";
import path from "node:path";

import { findFrontendProjects } from "../common/find-package-paths.mjs";
import { DistDir, DocsDir, PackagesDir, RootDir } from "../common/environment.mjs";
import { assertExistsAndIsFile } from "../common/io.mjs";

/**
 * @returns {Partial<TypeDocOptions>}
 */
function createBaseTypeDocOptions() {
    return {
    };
}

/**
 * @param {FrontendProject[]} frontendProjects
 * @returns {Partial<TypeDocOptions>[]}
 */
function createTypeDocOptionsForFrontendProjects(frontendProjects) {
    return frontendProjects.map(project => {
        return {
            ...createBaseTypeDocOptions(),
            basePath: project.root,
            entryPoints: [project.index],
            entryPointStrategy: "resolve",
            tsconfig: project.tsConfig,
            out: path.resolve(project.docs, "reflections.json"),
            plugin: [
                // "typedoc-plugin-merge-modules",
                // "typedoc-plugin-missing-exports",
                // "typedoc-plugin-dt-links",
                // "typedoc-plugin-mdn-links",
            ],
            // mergeModulesMergeMode: "module",
            // placeInternalsInOwningModule:false,
        };
    });
}

/**
 * Runs TypeDoc on each individual frontend project. Generates
 * a `reflections.json` file in the `docs` directory of each project.
 * This can be used in a following step to generate the actual
 * documentation HTML files with the contents of all projects.
 *
 * @param {FrontendProject[]} frontendProjects Frontend projects to run TypeDoc on.
 */
async function runTypeDocOnFrontendProjects(frontendProjects) {
    const individualTypeDocOptions = createTypeDocOptionsForFrontendProjects(frontendProjects);
    await Promise.all(individualTypeDocOptions.map(async options => {
        const app = await Application.bootstrapWithPlugins(options);
        const project = await app.convert();
        if (project === undefined) {
            throw new Error("Failed to convert project");
        }
        if (options.out === undefined) {
            throw new Error("Output directory is undefined");
        }
        // const json = path.resolve(options.out, "reflections.json");
        await app.generateJson(project, options.out);
    }));
}

/**
 * Generates the documentation for all frontend projects by merging
 * the generated `reflections.json` files from each project.
 * 
 * The HTML documentation will be generated in the `docs` directory.
 *
 * @param {FrontendProject[]} frontendProjects 
 */
async function generateMergedDocs(frontendProjects) {
    const entryPoints = frontendProjects.map(project => path.resolve(project.docs, "reflections.json"));
    const app = await Application.bootstrapWithPlugins({
        basePath: RootDir,
        entryPoints,
        entryPointStrategy: "merge",
        out: DocsDir,
        plugin: [
            "typedoc-plugin-merge-modules",
        ],
    });
    const project = await app.convert();
    if (project === undefined) {
        throw new Error("Failed to convert project");
    }
    await app.generateDocs(project, DocsDir);
}

// ============================================================================

/**
 * @param {FrontendProject[]} frontendProjects
 * @returns {Partial<TypeDocOptions>}
 */
function createTypeDocOptionsForFrontendProjects2(frontendProjects) {
    const tsConfig = path.resolve(RootDir, "tsconfig.json");
    const entryPoints = frontendProjects.map(project => project.index);
    return {
        ...createBaseTypeDocOptions(),
        basePath: RootDir,
        entryPoints,
        entryPointStrategy: "resolve",
        out: DocsDir,
        tsconfig: tsConfig,
        externalPattern: ["node_modules/**"],
        excludeExternals: true,
        plugin: [
            "typedoc-plugin-merge-modules",
            "typedoc-plugin-missing-exports",
            // "typedoc-plugin-dt-links",
            // "typedoc-plugin-mdn-links",
        ],
        // mergeModulesMergeMode: "module",
        // placeInternalsInOwningModule:true,
    };
}

/**
 * Runs TypeDoc on each individual frontend project. Generates
 * a `reflections.json` file in the `docs` directory of each project.
 * This can be used in a following step to generate the actual
 * documentation HTML files with the contents of all projects.
 *
 * @param {FrontendProject[]} frontendProjects Frontend projects to run TypeDoc on.
 */
async function runTypeDocOnFrontendProjects2(frontendProjects) {
    const options = createTypeDocOptionsForFrontendProjects2(frontendProjects);
    const app = await Application.bootstrapWithPlugins(options);
    const project = await app.convert();
    if (project === undefined) {
        throw new Error("Failed to convert project");
    }
    if (options.out === undefined) {
        throw new Error("Output directory is undefined");
    }
    // const json = path.resolve(options.out, "reflections.json");
    await app.generateDocs(project, options.out);
}

// ============================================================================

/**
 * @param {FrontendProject[]} frontendProjects
 * @returns {Partial<TypeDocOptions>}
 */
function createTypeDocOptionsForFrontendProjects3(frontendProjects) {
    const tsConfig = path.resolve(RootDir, "tsconfig.json");
    const mergedDeclarationsFile = path.resolve(DistDir, "index.d.ts");
    assertExistsAndIsFile(mergedDeclarationsFile, "Did you forget to run 'build:types' beforehand?");
    return {
        ...createBaseTypeDocOptions(),
        basePath: RootDir,
        entryPoints: [mergedDeclarationsFile],
        entryPointStrategy: "resolve",
        out: DocsDir,
        tsconfig: tsConfig,
        plugin: [
            "typedoc-plugin-merge-modules",
            // "typedoc-plugin-missing-exports",
            "typedoc-plugin-dt-links",
            "typedoc-plugin-mdn-links",
        ],
        // mergeModulesMergeMode: "module",
        // placeInternalsInOwningModule:false,
    };
}

/**
 * Runs TypeDoc on each individual frontend project. Generates
 * a `reflections.json` file in the `docs` directory of each project.
 * This can be used in a following step to generate the actual
 * documentation HTML files with the contents of all projects.
 *
 * @param {FrontendProject[]} frontendProjects Frontend projects to run TypeDoc on.
 */
async function runTypeDocOnFrontendProjects3(frontendProjects) {
    const options = createTypeDocOptionsForFrontendProjects3(frontendProjects);
    const app = await Application.bootstrapWithPlugins(options);
    const project = await app.convert();
    if (project === undefined) {
        throw new Error("Failed to convert project");
    }
    if (options.out === undefined) {
        throw new Error("Output directory is undefined");
    }
    await app.generateDocs(project, options.out);
}

// ============================================================================

/**
 * @param {FrontendProject[]} frontendProjects
 * @returns {Partial<TypeDocOptions>}
 */
function createTypeDocOptionsForFrontendProjects4(frontendProjects) {
    const tsConfig = path.resolve(PackagesDir, "tsconfig.typedoc.json");
    return {
        ...createBaseTypeDocOptions(),
        basePath: PackagesDir,
        entryPoints: [
            ...frontendProjects.map(project => project.index),
            ...frontendProjects.map(project => path.resolve(project.root, "src")),
        ],
        externalPattern: ["**/.yarn/**"],
        excludeExternals: true,
        entryPointStrategy: "expand",
        out: DocsDir,
        tsconfig: tsConfig,
        plugin: [
            "typedoc-plugin-merge-modules",
            "typedoc-plugin-missing-exports",
            // "typedoc-plugin-dt-links",
            // "typedoc-plugin-mdn-links",
        ],
        // mergeModulesMergeMode: "module",
        placeInternalsInOwningModule:true,
    };
}

/**
 * Runs TypeDoc on each individual frontend project. Generates
 * a `reflections.json` file in the `docs` directory of each project.
 * This can be used in a following step to generate the actual
 * documentation HTML files with the contents of all projects.
 *
 * @param {FrontendProject[]} frontendProjects Frontend projects to run TypeDoc on.
 */
async function runTypeDocOnFrontendProjects4(frontendProjects) {
    const options = createTypeDocOptionsForFrontendProjects4(frontendProjects);
    const app = await Application.bootstrapWithPlugins(options);
    const project = await app.convert();
    if (project === undefined) {
        throw new Error("Failed to convert project");
    }
    if (options.out === undefined) {
        throw new Error("Output directory is undefined");
    }
    await app.generateDocs(project, options.out);
}

// ============================================================================

/**
 * Runs TypeDoc to generate the documentation for all frontend
 * projects from the type annotations and JSDoc comments.
 */
async function main() {
    const frontendProjects = await findFrontendProjects();
    // await runTypeDocOnFrontendProjects(frontendProjects);
    // await generateMergedDocs(frontendProjects);
    // await runTypeDocOnFrontendProjects2(frontendProjects);
    await runTypeDocOnFrontendProjects3(frontendProjects);
    // await runTypeDocOnFrontendProjects4(frontendProjects);
}

main().catch(e => {
    console.error("Failed to generate documentation");
    console.error(e instanceof Error ? e.stack : e);
    process.exit(1);
});
