import path from "node:path";
import fs from "node:fs/promises";

import {
    createSolutionBuilder,
    createSolutionBuilderHost
} from "typescript";

const isProduction = process.env.NODE_ENV !== "development";

// Search for all packages with a tsconfig.json file
// This way, we don't have to create an extra file
// and list out all packages manually.
const entries = await fs.readdir(
    "./packages",
    { recursive: true, withFileTypes: true }
);
const packageReferences = entries
    .filter(e => e.isFile() && e.name === "tsconfig.json")
    .map(e => path.resolve(e.parentPath, e.name))
    .map(p => path.dirname(p));

// Build all packages with TypeScript
const host = createSolutionBuilderHost();
const builder = createSolutionBuilder(host, packageReferences, {
    force: isProduction,
    verbose: !isProduction,
});

// Handle the result
const exitStatus = builder.build();
process.exit(exitStatus);