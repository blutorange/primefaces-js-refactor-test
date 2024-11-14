/** @import { FrontendProject } from "../common/find-package-paths.mjs"; */
/** @import { StringReplacement } from "../common/string-replace.mjs" */

import path from "node:path";
import fs from "node:fs/promises";
import { pipeline } from "node:stream/promises";

import {
    createSolutionBuilder,
    createSolutionBuilderHost
} from "typescript";

import { findFrontendProjects } from "../common/find-package-paths.mjs";
import { DistDir, IsProduction } from "../common/environment.mjs";
import { deleteIfExists, ensureDirectoryExists } from "../common/io.mjs";
import { getAllCommentPragmas } from "../common/comment-pragma.mjs";
import { applyStringReplacements } from "../common/string-replace.mjs";

/**
 * Removes all reference comment pragmas from the given
 * TypeScript / JavaScript code that need to be at the
 * top of a source file and appends them to the given
 * pragma array.
 * 
 * Basically, removes all comments that look something
 * like `/// <reference ... />`.
 * 
 * @param {string} code The TypeScript / JavaScript code.
 * @param {string[]} pragmas The array to which the pragmas are appended.
 * @returns {string} The code with the reference pragmas removed.
 */
function extractAndRemoveTopCommentPragmas(code, pragmas) {
    const commentPragmas = getAllCommentPragmas(code);
    /** @type {StringReplacement[]} */
    const replacements = [];
    for (const { comment: { start, end }, pragma } of commentPragmas) {
        if (pragma.type === "TripleSlashXML") {
            const source = code.substring(start, end);
            pragmas.push(source);
            replacements.push({ start, end, value: "" });
        }
    }
    return applyStringReplacements(code, replacements);
}

/**
 * Runs TypeScript on the given package paths and returns the exit status.
 * @param {FrontendProject[]} frontendProjects 
 * @returns {Promise<number>}
 */
async function runTypeScript(frontendProjects) {
    const host = createSolutionBuilderHost();
    const rootNames = frontendProjects.map(project => project.tsConfig);
    const builder = createSolutionBuilder(host, rootNames, {
        force: IsProduction,
        verbose: !IsProduction,
    });
    return builder.build();
}

/**
 * Creates an `index.d.ts` file with the contents of all type
 * declaration files form the individual frontend projects.
 * @param {FrontendProject[]} frontendProjects 
 */
async function createMergedTypeDeclarationFile(frontendProjects) {
    const outPath = path.resolve(DistDir, "index.d.ts");
    const tempOutPath = path.resolve(DistDir, "index_temp.d.ts");
    try {
        // Collect all type declaration files that need to be merged
        const inPaths = frontendProjects.map(project => path.resolve(project.dist, "index.d.ts"));

        // Delete output files if they exist,and create
        // the output directory if it doesn't exist
        await deleteIfExists(outPath);
        await deleteIfExists(tempOutPath);
        await ensureDirectoryExists(DistDir);

        // Note: Triple slash comment pragmas such as `/// <reference ... />`
        // need to be moved to the top of the merged type declaration file.

        // Write the type declarations without comment pragmas to the temp file
        const tempOutFile = await fs.open(tempOutPath, "a");
        /** @type {string[]} */
        const pragmas = [];
        try {
            for (const inPath of inPaths) {
                const content = await fs.readFile(inPath, "utf-8");
                extractAndRemoveTopCommentPragmas(content, pragmas);
                await tempOutFile.appendFile(content, { encoding: "utf-8" });
            }
        } finally {
            await tempOutFile.close();
        }

        // Append the comment pragmas at the top of the out file,
        // then add the type declarations from the temp file
        const outFile = await fs.open(outPath, "a");
        try {
            const outWriteStream = outFile.createWriteStream();
            for (const pragma of pragmas) {
                await outFile.appendFile(pragma, { encoding: "utf-8" });
                await outFile.appendFile("\n", { encoding: "utf-8" });
            }
            const inFile = await fs.open(tempOutPath, "r");
            await pipeline(inFile.createReadStream(), outWriteStream, { end: false });
        } finally {
            await outFile.close();
        }
    } finally {
        await deleteIfExists(tempOutPath);
    }

    console.log(`Wrote merged type declaration file to <${outPath}>`);
}

async function main() {
    const t1 = Date.now();

    const frontendProjects = await findFrontendProjects();
    console.log(`Running TypeScript on ${frontendProjects.length} projects...`);

    const t2 = Date.now();
    const exitStatus = await runTypeScript(frontendProjects);

    const t3 = Date.now();
    await createMergedTypeDeclarationFile(frontendProjects);

    const t4 = Date.now();
    console.log(`Collected frontend projects in ${t2 - t1} ms`);
    console.log(`Created type declaration files in ${t3 - t2} ms`);
    console.log(`Merged type declarations in ${t4 - t3} ms`);

    if (exitStatus !== 0) {
        throw new Error(`TypeScript failed with exit status ${exitStatus}`);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});

