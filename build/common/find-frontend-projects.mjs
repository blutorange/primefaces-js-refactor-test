import path from "node:path";
import fs from "node:fs/promises";

import { assertDoesNotExist, assertExistsAndIsFile, ensureDirectoryExists, existsAndIsDirectory, existsAndIsFile } from "./file.mjs";
import { PackagesDir } from "./environment.mjs";

/**
 * Represents a frontend project with JavaScript and CSS files.
 * Each frontend project gets bundles into a single JavaScript
 * and CSS file.
 * @typedef {{
 * readonly dist: string;
 * readonly docs: string;
 * readonly index: string;
 * readonly name: string;
 * readonly root: string;
 * readonly scriptRoot: string;
 * readonly tsConfig: string;
 * }} FrontendProject
 */
undefined;

/**
 * Given the base folder of a frontend project, finds all relevant paths,
 * performs some basic checks, and returns a {@link FrontendProject}.
 * @param {string} root Base folder of the frontend project.
 * @returns {Promise<FrontendProject>} The frontend project.
 */
async function createFrontendProject(root) {
    const name = path.relative(PackagesDir, root);
    const dist = path.resolve(root, "dist");
    const docs = path.resolve(root, "docs");
    const tsConfig = path.resolve(root, "tsconfig.json");
    const bundleJs = path.resolve(root, "bundle.js");
    const bundleTs = path.resolve(root, "bundle.ts");
    const indexJs = path.resolve(root, "src", "module", "index.js");
    const indexTs = path.resolve(root, "src", "module", "index.ts");
    const scriptRoot = path.resolve(root, "src", "script");

    const index = await existsAndIsFile(indexTs) ? indexTs : indexJs;

    await Promise.all([
        ensureDirectoryExists(root),
        assertExistsAndIsFile(tsConfig),
        async () => {
            const indexExists = await existsAndIsFile(index);
            const scriptRootExists = await existsAndIsDirectory(scriptRoot);
            if (!indexExists && !scriptRootExists) {
                throw new Error(`[root] At least a script root folder named 'script' or a module index file ('index.ts' or 'index.js') must exist.`);
            }
        },
        assertDoesNotExist(bundleJs, `[${bundleJs}] bundle is an automatic output file containing the bundled declarations from all source file. Creating this file would conflict with dist/bundle.d.ts`),
        assertDoesNotExist(bundleTs, `[${bundleJs}] bundle is an automatic output file containing the bundled declarations from all source file. Creating this file would conflict with dist/bundle.d.ts`),
    ]);

    return { dist, docs, index, name, root, scriptRoot, tsConfig };
}

/**
 * Finds all package paths in the workspace. That is, all
 * directories with an index.ts or index.js file. After
 * bundling, each package results in a JavaScript and/or
 * CSS file. 
 * 
 * Projects are returned in alphabetical order, see
 * {@link FrontendProject.name}.
 * @returns {Promise<FrontendProject[]>}
 */
export async function findFrontendProjects() {
    // Search for all packages with a tsconfig.json file
    // This way, we don't have to create an extra file
    // and list out all packages manually.
    const entries = await fs.readdir(
        PackagesDir,
        { recursive: true, withFileTypes: true }
    );

    const folders = entries
        .filter(e => e.isFile() && e.name === "tsconfig.json")
        .map(e => path.normalize(e.parentPath));

    const frontendProjects = await Promise.all(folders.map(createFrontendProject));
    frontendProjects.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    return frontendProjects;
}
