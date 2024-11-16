/** @import { TypeDocOptions } from "typedoc"; */
/** @import { FrontendProject} from "../common/find-frontend-projects.mjs" */

import { Application } from "typedoc";
import path from "node:path";

import { findFrontendProjects } from "../common/find-frontend-projects.mjs";
import { DistDir, DocsDir, RootDir } from "../common/environment.mjs";
import { assertExistsAndIsFile } from "../common/file.mjs";
import { logError } from "../common/error.mjs";

/**
 * @returns {Partial<TypeDocOptions>}
 */
function createBaseTypeDocOptions() {
    return {
    };
}

/**
 * @param {FrontendProject[]} frontendProjects
 * @returns {Partial<TypeDocOptions>}
 */
function createTypeDocOptionsForFrontendProjects(frontendProjects) {
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
 * Runs TypeDoc on the generated merged declaration file with the contents
 * of all frontend projects. Writes the HTML documentation to the `docs`
 * directory. 
 *
 * @param {FrontendProject[]} frontendProjects Frontend projects to run TypeDoc on.
 */
async function runTypeDocOnFrontendProjects(frontendProjects) {
    const options = createTypeDocOptionsForFrontendProjects(frontendProjects);
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
    const frontendProjects = await findFrontendProjects();
    await runTypeDocOnFrontendProjects(frontendProjects);
}

main().catch(e => {
    console.error("Failed to generate documentation");
    logError(e);
    process.exit(1);
});
