import { join } from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { copy } from "fs-extra/esm";

const dirname = fileURLToPath(import.meta.url);
const baseDir = join(dirname, "..", "..");

async function copyTypeDeclarations(source, target) {
    console.log(`Copying type declarations from ${source} to ${target}`);
    await copy(source, target, {
        filter: async src => {
            const stat = await fs.stat(src);
            return stat.isDirectory() || src.endsWith(".d.ts");
        },
    });
}

async function runTypeScriptCompiler() {
    await import("typescript/lib/tsc.js")
}

async function main() {
    console.log(`Generating type declarations in ${baseDir}`);
    await fs.rm(join(baseDir, "dist"), { recursive: true, force: true });
    await fs.mkdir(join(baseDir, "dist"), { recursive: true });
    await copyTypeDeclarations(join(baseDir, "src"), join(baseDir, "dist"));
    await runTypeScriptCompiler();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});