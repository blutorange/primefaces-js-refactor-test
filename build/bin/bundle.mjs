import path from "node:path";
import fs from "node:fs/promises";

import * as esbuild from "esbuild";

import { DistDir, IsProduction, RootDir } from "../common/environment.mjs";
import { ensureDirectoryExists } from "../common/file.mjs";
import { findFrontendProjects } from "../common/find-frontend-projects.mjs";

/**
 * @returns {Promise<esbuild.BuildOptions["entryPoints"]>}
 */
async function createEntryPoints() {
    const frontendProjects = await findFrontendProjects();
    return frontendProjects
        .filter(project => project.name !== "types")
        .map(project => ({ in: project.index, out: project.name }));
}

/**
 * Build script that invokes ESBuild on each individual frontend project.
 * 
 * Also writes a `dist/meta.json` file that contains the meta file output 
 * from ESBuild. You can use e.g. https://esbuild.github.io/analyze/
 * to visualize the bundle and its contents.
 */
async function main() {
    ensureDirectoryExists(DistDir);

    const entryPoints = await createEntryPoints();
    const buildResult = await esbuild.build({
        absWorkingDir: RootDir,
        outdir: "dist",
        metafile: true,
        bundle: true,
        minify: IsProduction,
        target: "es6",
        entryPoints,
        logLevel: "info",
        write: true,
        plugins: [],
    });

    const metaFilePath = path.resolve(DistDir, "meta.json");
    await fs.writeFile(metaFilePath, JSON.stringify(buildResult.metafile, null, 2));
    console.log(`Wrote meta file to ${metaFilePath}`);
}

main().catch(e => {
    console.error(e instanceof Error ? e.stack : e);
    process.exit(1);
});