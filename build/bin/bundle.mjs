import path from "node:path";
import fs from "node:fs/promises";

import * as esbuild from "esbuild";
import { DistDir, IsProduction, RootDir } from "../common/environment.mjs";
import { deleteIfExists, ensureDirectoryExists } from "../common/io.mjs";
import { findFrontendProjects } from "../common/find-package-paths.mjs";

/**
 * @returns {Promise<esbuild.BuildOptions["entryPoints"]>}
 */
async function createEntryPoints() {
    const frontendProjects = await findFrontendProjects();
    return frontendProjects.map(project => ({ in: project.index, out: project.name }));
}

async function main() {
    if (IsProduction) {
        deleteIfExists(DistDir);
    }
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

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
