/** @import { TypeDocOptions } from "typedoc"; */

import path from "node:path";

import { Application } from "typedoc";

import { DistDir, DocsDir, RootDir } from "../common/environment.mjs";
import { assertExistsAndIsFile } from "../lang/file.mjs";
import { logError } from "../lang/error.mjs";

/**
 * @returns {Partial<TypeDocOptions>}
 */
function createBaseTypeDocOptions() {
    return {
        basePath: RootDir,
        excludeExternals: true,
        externalPattern: ["**/node_modules/**"],
    };
}

/**
 * @returns {Partial<TypeDocOptions>}
 */
function createTypeDocOptionsForFrontendProjects() {
    const tsConfig = path.resolve(RootDir, "tsconfig.json");
    const declarationsFile = path.resolve(DistDir, "index.d.ts");
    assertExistsAndIsFile(declarationsFile, "Did you forget to run 'build:types' beforehand?");
    return {
        ...createBaseTypeDocOptions(),
        entryPoints: [declarationsFile],
        entryPointStrategy: "resolve",
        out: DocsDir,
        tsconfig: tsConfig,
        plugin: [
            "./build/typedoc-plugin/typeof-class-plugin.mjs",
            "./build/typedoc-plugin/rename-module-plugin.mjs",
            "typedoc-plugin-merge-modules",
            "typedoc-plugin-dt-links",
            "typedoc-plugin-mdn-links",
        ],
        // @ts-expect-error
        mergeModulesMergeMode: "module",
    };
}

/**
 * Runs TypeDoc on the generated merged declaration file with the contents
 * of all frontend projects. Writes the HTML documentation to the `docs`
 * directory. 
 */
async function runTypeDocOnFrontendProjects() {
    const options = createTypeDocOptionsForFrontendProjects();
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

/**
 * Runs TypeDoc to generate the documentation for all frontend
 * projects from the type annotations and JSDoc comments.
 */
async function main() {
    const t1 = Date.now();
    await runTypeDocOnFrontendProjects();
    const t2 = Date.now();
    console.log(`Documentation generated in ${t2 - t1}ms`);
}

main().catch(e => {
    console.error("Failed to generate documentation");
    logError(e);
    process.exit(1);
});
