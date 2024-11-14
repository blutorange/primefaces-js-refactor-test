import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";

import * as esbuild from "esbuild";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const baseDir = path.resolve(currentDir, "..", "..");

/** @type {import("esbuild").BuildOptions["entryPoints"]} */
const entryPoints = [
    { in: "packages/jquery/index.ts", out: "jquery" },
    { in: "packages/core/index.ts", out: "core" },
    { in: "packages/components/index.ts", out: "components" },
    { in: "packages/schedule/index.ts", out: "schedule" },
];

async function main() {
    const result = await esbuild.build({
        absWorkingDir: baseDir,
        outdir: "dist",
        metafile: true,
        bundle: true,
        minify: true,
        target: "es6",
        entryPoints,
        logLevel: "info",
        write: true,
        plugins: [
        ],
    });

    const metaFilePath = path.resolve(baseDir, "dist", "meta.json");
    await fs.writeFile(metaFilePath, JSON.stringify(result.metafile, null, 2));
    console.log(`Wrote meta file to ${metaFilePath}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
