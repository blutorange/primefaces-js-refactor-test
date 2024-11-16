/** @import { Statement } from "oxc-parser"; */
/** @import { JsonObject } from "type-fest" */

/**
 * @typedef {"module" | "script"} SourceFileType
 */
undefined;

import { parseAsync } from "oxc-parser";
import { walkJson } from "../common/json-walker.mjs";

/** @type {Set<Statement["type"]>} */
const ImportExportStatementTypes = new Set([
    "ImportDeclaration",
    "ExportNamedDeclaration",
    "ExportAllDeclaration",
    "ExportDefaultDeclaration",
    "TSNamespaceExportDeclaration",
]);

const ScriptFileExtension = new Set([".ts", ".js", ".mts", ".cts", ".cts", ".mts"]);

/**
 * @param {string} content 
 * @param {string} fileName 
 * @returns {Promise<SourceFileType>}
 */
async function findSourceFileKind(content, fileName) {
    const ast = await parseAsync(content, { sourceFilename: fileName });
    const bodyStatements = ast.program.body;
    if (bodyStatements.some(statement => ImportExportStatementTypes.has(statement.type))) {
        return "module";
    }
    // Technically, we'd also need to check for import.meta anywhere in the file
    walkJson(/** @type {JsonObject} */(/** @type {unknown} */ (ast.program)), {
        objectEntry(key, value) {
            if (key === "type" && value === "MetaProperty") {
                throw new Error("import.meta is not allowed in scripts");
            }

        }
    });
    return "script";
}
