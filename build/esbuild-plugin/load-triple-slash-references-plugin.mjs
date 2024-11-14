/** @import { TypeScriptPragma } from "../common/comment-pragma.mjs" */
/** @import { StringReplacement } from "../common/string-replace.mjs" */

import fs from "node:fs/promises";
import path from "node:path";

import { getAllCommentPragmas } from "../common/comment-pragma.mjs"
import { applyStringReplacements } from "../common/string-replace.mjs";

/**
 * Options for the reference pragma loader plugin.
 * 
 * - `fileFilter` - Optional filter for the TypeScript files to which the
 *   plugin should be applied. If not specified, the plugin will be applied
 *   to all TypeScript (and TSX) files. The RegExp is matched against the
 *   fully resolved file path of the TypeScript file.
 * - `pragmaFilter` - Optional test for deciding whether a pragma should be
 *   loaded. If not specified, all pragmas will be loaded. The function
 *   receives the pragma object and should return true if the pragma should
 *   be loaded, or false if it should be ignored. For example, if the
 *   directive is 
 *   ```js
 *   /// <reference types="jquery" preserve="true" />
 *   ```
 *   Then the pragma object will be
 *   ```js
 *   { name: "reference", args: { types: "jquery", preserve: "true" } }
 *   ```
 * @typedef {{
 * fileFilter?: RegExp;
 * pragmaFilter?: (pragma: TypeScriptPragma) => boolean;
 * }} ReferencePragmaLoaderPluginOptions
 */
undefined;

const PluginName = "load-triple-slash-references-plugin";

/**
 * Replaces all triple-slash reference pragmas with the appropriate
 * import() statements. Returns the code unchanged if it contains no
 * reference pragmas.
 * 
 * @param {string} code Code to replace the reference pragmas in.
 * @param {(pragma: TypeScriptPragma) => boolean} pragmaFilter A
 * filter to decide which pragmas to replace.
 * @returns {string} The code with the reference pragmas replaced.
 */
function replaceReferenceCommentPragmas(code, pragmaFilter) {
  const commentPragmas = getAllCommentPragmas(code);

  /** @type {StringReplacement[]} */
  const replacements = [];

  // Find all reference pragmas and compute the replacement code
  for (const { comment, pragma } of commentPragmas) {
    if (pragma.name === "reference") {
      if (pragma.args.path || pragma.args.types) {
        if (pragmaFilter(pragma)) {
          const importPath = JSON.stringify(pragma.args.path ?? pragma.args.types);
          replacements.push({ start: comment.start, end: comment.end, value: `import ${importPath};` });
        }
      }
    }
  }

  return applyStringReplacements(code, replacements);
}

/**
 * Creates a new plugin for ESBuild that interprets triple-slash references
 * as used by TypeScript.
 * 
 * For example,
 * 
 * ```ts
 * /// <reference types="jquery" />
 * some_code();
 * ```
 * 
 * will be transformed into
 * 
 * ```js
 * import "jquery";
 * some_code();
 * ```
 * 
 * @param {ReferencePragmaLoaderPluginOptions} options Options for the plugin.
 * @returns {import("esbuild").Plugin} A new plugin instance with the specified options.
 */
export function referencePragmaLoaderPlugin(options) {
  const fileFilter = options.fileFilter ?? /\.[mc]?tsx?$/;
  const pragmaFilter = options.pragmaFilter ?? (() => true);
  return {
    name: PluginName,
    setup: (build) => {
      build.onLoad({ filter: fileFilter, namespace: "file" }, async args => {
        const contents = await fs.readFile(args.path, "utf-8");
        const converted = replaceReferenceCommentPragmas(contents, pragmaFilter);
        const loader = args.path.endsWith("x") ? "tsx" : "ts";
        return { contents: converted, resolveDir: path.dirname(args.path), loader };
      });
    },
  };
}
