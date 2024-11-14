import path from "node:path";
import fs from "node:fs/promises";

import { assertExistsAndIsFile, ensureDirectoryExists, existsAndIsFile } from "./io.mjs";
import { PackagesDir } from "./environment.mjs";

/**
 * @typedef {{
 * readonly dist: string;
 * readonly index: string;
 * readonly name: string;
 * readonly root: string;
 * readonly tsConfig: string;
 * }} FrontendProject
 */
undefined;

/**
 * @param {string} root 
 * @returns {Promise<FrontendProject>}
 */
async function createFrontendProject(root) {
    const name = path.dirname(root);
    const dist = path.resolve(root, "dist");
    const indexJs = path.resolve(root, "index.js");
    const indexTs = path.resolve(root, "index.ts");
    const tsConfig = path.resolve(root, "tsconfig.json");
    const index = await existsAndIsFile(indexTs) ? indexTs : indexJs;
    await Promise.all([
        assertExistsAndIsFile(index),
        assertExistsAndIsFile(tsConfig),
        ensureDirectoryExists(dist),
    ]);
    return { dist, index, name, root, tsConfig };
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
