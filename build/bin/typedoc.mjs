import path from "node:path";
import { fileURLToPath } from "node:url";

import { Application } from "typedoc";

const dirName = path.dirname(fileURLToPath(import.meta.url));
const baseDir = path.resolve(dirName, "..", "..");

/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
    entryPoints: [
        "./packages/types/index.ts",
        "./packages/types/src/core.types.ts",
        "./packages/jquery/index.ts",
        "./packages/jquery/lib/jquery.ts",
        "./packages/core/index.ts",
        "./packages/core/src/BaseWidget.ts",
        "./packages/core/src/DeferredWidget.ts",
        "./packages/components/index.ts",
        "./packages/components/src/InputTextArea.ts",
        "./packages/schedule/index.ts",
        "./packages/schedule/src/Schedule.ts",
        "./packages/schedule/lib/fullcalendar.ts",
    ],
    entryPointStrategy: "resolve",
    tsconfig: "./packages/tsconfig.typedoc.json",
    out: "docs",
    plugin: [
        "typedoc-plugin-merge-modules",
        // "typedoc-plugin-missing-exports",
        // "typedoc-plugin-dt-links",
        // "typedoc-plugin-mdn-links",
    ],
    // mergeModulesMergeMode: "module",
    // placeInternalsInOwningModule:false,
};

async function main() {
    const app = await Application.bootstrapWithPlugins({
        ...config,
    });
    const project = await app.convert();
    if (project === undefined) {
        throw new Error("Failed to convert project");
    }
    await app.generateDocs(project, "docs");
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
