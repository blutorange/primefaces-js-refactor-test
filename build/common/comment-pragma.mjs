/**
 * Type of EcmaScript token types that can appear before the program node.
 * - ws - Whitespace
 * - line - Line terminator
 * - hash - Hash character (#)
 * - slash - Slash character (/)
 * @typedef {"ws" | "line" | "hash" | "slash"} EcmaScriptTokenType
 */
undefined;

/**
 * A hash bang comment in a piece of EcmaScript source code.
 * - start - The starting position of the comment (inclusive), with the leading `#!`.
 * - end - The ending position of the comment (exclusive), before the line terminator of end-of-input.
 * @typedef {{
* readonly type: "hash-bang";
* readonly start: number;
* readonly end: number;
* }} EcmaScriptHashBangComment 
*/
undefined;

/**
 * A single-line comment in a piece of EcmaScript source code.
 * - start - The starting position of the comment (inclusive), with the leading `//`.
 * - end - The ending position of the comment (exclusive), before the line terminator or end-of-input.
 * @typedef {{
 * readonly type: "single";
 * readonly start: number;
 * readonly end: number;
 * }} EcmaScriptSingleLineComment 
 */
undefined;

/**
 * A multi-line comment in a piece of EcmaScript source code.
 * - start - The starting position of the comment (inclusive), with the leading `/*`.
 * - end - The ending position of the comment (exclusive), with the trailing *&#47;
 * @typedef {{
 * readonly type: "multi";
 * readonly start: number;
 * readonly end: number;
 * }} EcmaScriptMultiLineComment 
 */
undefined;

/**
 * A single-line or multi-line comment in a piece of EcmaScript source code.
 * @typedef {EcmaScriptHashBangComment | EcmaScriptSingleLineComment | EcmaScriptMultiLineComment} EcmaScriptComment 
 */
undefined;

/**
 * Type of comment pragmas that can appear in TypeScript / JavaScript code.
 * - TripleSlashXML - A triple-slash XML comment pragma, e.g. `/// <reference types="jquery" />`.
 * - SingleLine - A single-line comment pragma, e.g. "// &#64;ts-check".
 * - MultiLine - A multi-line comment pragma, e.g. "/* &#64;jsxRuntime classic *&#47;".
 * @typedef {"TripleSlashXML" | "SingleLine" | "MultiLine"} PragmaKindFlag
 */
undefined;

/**
 * @typedef {{
 * readonly name: string;
 * readonly type: PragmaKindFlag;
 * readonly args: Record<string, string | undefined>;
 * }} TypeScriptPragma
 */
undefined;

/**
 * @typedef {{
 * readonly comment: EcmaScriptComment;
 * readonly pragma: TypeScriptPragma;
* }} TypeScriptCommentPragma
*/
undefined;


/**
 * @typedef {{
 * args?: {
 *   name: string;
 *   optional?: boolean;
 *   captureSpan?: boolean;
 * }[];
 * kind: PragmaKindFlag;
 * }} PragmaSpecs
 */
undefined;

/** @type {Map<string, RegExp>} */
const NamedArgRegExCache = new Map();

/**
 * From
 * https://github.com/microsoft/TypeScript/blob/b58ac4abf2d58d6309274c22762e2196789476d9/src/compiler/parser.ts#L10673C1-L10674C1
 * 
 * RegExp for a triple-slash XML comment, e.g. `/// <reference types="jquery" />`.
 */
const TripleSlashXMLCommentStartRegEx = /^\/\/\/\s*<(\S+)\s.*?\/>/m;;

/**
 * From
 * https://github.com/microsoft/TypeScript/blob/b58ac4abf2d58d6309274c22762e2196789476d9/src/compiler/types.ts#L10169
 * 
 * Defines the arguments for various comment pragmas, such as the `/// <reference>` comment pragma.
 * @type {Record<string , PragmaSpecs | undefined>}
 */
const CommentPragmas = {
  "reference": {
    args: [
      { name: "types", optional: true, captureSpan: true },
      { name: "lib", optional: true, captureSpan: true },
      { name: "path", optional: true, captureSpan: true },
      { name: "no-default-lib", optional: true },
      { name: "resolution-mode", optional: true },
      { name: "preserve", optional: true },
    ],
    kind: "TripleSlashXML",
  },
  "amd-dependency": {
    args: [{ name: "path" }, { name: "name", optional: true }],
    kind: "TripleSlashXML",
  },
  "amd-module": {
    args: [{ name: "name" }],
    kind: "TripleSlashXML",
  },
  "ts-check": {
    kind: "SingleLine",
  },
  "ts-nocheck": {
    kind: "SingleLine",
  },
  "jsx": {
    args: [{ name: "factory" }],
    kind: "MultiLine",
  },
  "jsxfrag": {
    args: [{ name: "factory" }],
    kind: "MultiLine",
  },
  "jsximportsource": {
    args: [{ name: "factory" }],
    kind: "MultiLine",
  },
  "jsxruntime": {
    args: [{ name: "factory" }],
    kind: "MultiLine",
  }
};

/**
 * Maps source code characters to their respective EcmaScript token types.
 * 
 * - Whitespace characters are: <TAB>, <VT>, <FF>, <ZWNBSP>, <USP>
 *   See https://tc39.es/ecma262/#prod-WhiteSpace
 *   <USP> is the Unicode category Space_Separator
 * - Line terminators are: LF, CR, LS, PS
 *   See https://tc39.es/ecma262/#sec-ecmascript-language-source-code
 * @type {Record<string, EcmaScriptTokenType | undefined>}
 */
const EcmaScriptTokenTypes = {
  "\u0009": "ws",
  "\u000B": "ws",
  "\u000C": "ws",
  "\uFEFF": "ws",
  "\u0020": "ws",
  "\u00A0": "ws",
  "\u1680": "ws",
  "\u2000": "ws",
  "\u2001": "ws",
  "\u2002": "ws",
  "\u2003": "ws",
  "\u2004": "ws",
  "\u2005": "ws",
  "\u2006": "ws",
  "\u2007": "ws",
  "\u2008": "ws",
  "\u2009": "ws",
  "\u200A": "ws",
  "\u202F": "ws",
  "\u205F": "ws",
  "\u3000": "ws",
  "\u000A": "line",
  "\u000D": "line",
  "\u2028": "line",
  "\u2029": "line",
  "#": "hash",
  "/": "slash",
};

/**
 * From
 * https://github.com/microsoft/TypeScript/blob/b58ac4abf2d58d6309274c22762e2196789476d9/src/compiler/parser.ts#L10664C1-L10672C1
 * 
 * Gets ors creates the RegExp object for a named argument in a comment pragma.
 * @param {string} name The name of the argument.
 * @returns {RegExp} The RegExp object for the named argument.
 */
function getNamedArgRegEx(name) {
  const regExp = NamedArgRegExCache.get(name);
  if (regExp !== undefined) {
    return regExp;
  }
  const result = new RegExp(`(\\s${name}\\s*=\\s*)(?:(?:'([^']*)')|(?:"([^"]*)"))`, "im");
  NamedArgRegExCache.set(name, result);
  return result;
}

/**
 * https://tc39.es/ecma262/#prod-SingleLineCommentChars
 *
 * ```
 * SingleLineCommentChars ::
 *     SingleLineCommentChar SingleLineCommentChars[opt]
 * 
 * SingleLineCommentChar ::
 *     SourceCharacter but not LineTerminator
 * 
 * SourceCharacter ::
 *     any Unicode code point
 * ```
 * @param {string} code 
 * @param {number} i 
 * @returns {number}
 */
function consumeSingleLineCommentChars(code, i) {
  while (i < code.length && EcmaScriptTokenTypes[code[i]] !== "line") {
    i++;
  }
  return i;
}

/**
 * https://tc39.es/ecma262/#prod-MultiLineCommentChars
 *
 * ```
 * MultiLineCommentChars ::
 *     MultiLineNotAsteriskChar MultiLineCommentChars[opt]
 *     <*> PostAsteriskCommentChars[opt]
 * 
 * PostAsteriskCommentChars ::
 *     MultiLineNotForwardSlashOrAsteriskChar MultiLineCommentChars[opt]
 *     <*> PostAsteriskCommentChars[opt]
 * 
 * MultiLineNotAsteriskChar ::
 *     SourceCharacter but not <*>
 * 
 * MultiLineNotForwardSlashOrAsteriskChar ::
 *     SourceCharacter but not one of </> or <*>
 * 
 * SourceCharacter ::
 *     any Unicode code point
 * ```
 * @param {string} code 
 * @param {number} i 
 * @returns {number}
 */
function consumeMultiLineCommentChars(code, i) {
  while (i < code.length) {
    if (code[i] === "*" && code[i + 1] === "/") {
      return i;
    }
    i++;
  }
  throw new Error("Unexpected end-of-input in multi-line comment");
}

/**
 * https://tc39.es/ecma262/#prod-HashbangComment
 *
 * ```
 * HashbangComment ::
 *     <#> <!> SingleLineCommentChars[opt]
 * ```
 * @param {string} code 
 * @param {number} i
 * @param {EcmaScriptComment[]} comments
 * @returns {number}
 */
function consumeHashBang(code, i, comments) {
  const start = i;
  if (code[i] !== "#") {
    throw new Error(`Expected hash character (#) at position ${i}");`);
  }
  i++;
  if (code[i] !== "!") {
    throw new Error(`Expected bang character (!) at position ${i}`);
  }
  i++;
  i = consumeSingleLineCommentChars(code, i);
  comments.push({ type: "hash-bang", start, end: i });
  return i;
}

/**
 * https://tc39.es/ecma262/#prod-SingleLineComment
 *
 * ```
 * SingleLineComment ::
 *     </> </> SingleLineCommentChars[opt]
 * ```
 * @param {string} code 
 * @param {number} i 
 * @param {EcmaScriptComment[]} comments
 * @returns {number}
 */
function consumeSingleLineComment(code, i, comments) {
  const start = i;
  if (code[i] !== "/") {
    throw new Error(`Expected slash character (/) at position ${i}`);
  }
  i++;
  if (code[i] !== "/") {
    throw new Error(`Expected slash character (/) at position ${i}`);
  }
  i++;
  i = consumeSingleLineCommentChars(code, i);
  comments.push({ type: "single", start, end: i });
  return i;
}

/**
 * https://tc39.es/ecma262/#prod-MultiLineComment
 * 
 * ```
 * MultiLineComment ::
 * </> <*> MultiLineCommentChars[opt] <*> </>
 * ```
 * @param {string} code 
 * @param {number} i 
 * @param {EcmaScriptComment[]} comments
 * @returns {number}
 */
function consumeMultiLineComment(code, i, comments) {
  const start = i;
  if (code[i] !== "/") {
    throw new Error(`Expected slash character (/) at position ${i}`);
  }
  i++;
  if (code[i] !== "*") {
    throw new Error(`Expected star character (*) at position ${i}`);
  }
  i++;
  i = consumeMultiLineCommentChars(code, i);
  comments.push({ type: "multi", start, end: i });
  if (code[i] !== "*") {
    throw new Error(`Expected star character (*) at position ${i}`);
  }
  i++;
  if (code[i] !== "/") {
    throw new Error(`Expected slash character (/) at position ${i}`);
  }
  i++;
  return i;
}

/**
 * https://tc39.es/ecma262/#prod-Comment
 *
 * ```
 * Comment ::
 *     MultiLineComment
 *     SingleLineComment
 * ```
 * @param {string} code 
 * @param {number} i
 * @param {EcmaScriptComment[]} comments
 * @returns {number} 
 */
function consumeComment(code, i, comments) {
  if (code[i] !== "/") {
    throw new Error(`Expected slash character (/) at position ${i}`);
  }
  switch (code[i + 1]) {
    case "/":
      return consumeSingleLineComment(code, i, comments);
    case "*":
      return consumeMultiLineComment(code, i, comments);
    default:
      throw new Error(`Expected slash (/) or star (*) character at position ${i + 1}`);
  }
}

/**
 * Parses the header of a TypeScript file for comments, before any program
 * code. Returns the comments found in the header.
 * 
 * Used to parse triple slash references. These must appear
 * at the very beginning of the file, before the program node. Only
 * comments (line and block) and hash bangs (#!) are allowed before a
 * triple-slash directive, so effectively, we only needs to parse the
 * beginning of the file for comments.
 * 
 * @param {string} code Code to parse for comments.
 * @returns {EcmaScriptComment[]} Comments that appear before the program.
 */
function consumeEcmaScriptProgramHeader(code) {
  /** @type {EcmaScriptComment[]} */
  const comments = [];
  let i = 0;
  loop: while (i < code.length) {
    const char = code[i];
    const tokenType = EcmaScriptTokenTypes[char];
    switch (tokenType) {
      case "line":
      case "ws":
        i++;
        break;
      case "hash":
        if (i !== 0 && (i !== 1 || code[0] !== "\uFEFF")) {
          throw new Error("Hash bang (#!) must appear at the beginning of the file.");
        }
        i = consumeHashBang(code, i, comments);
        break;
      case "slash":
        i = consumeComment(code, i, comments);
        break;
      // Some other source character
      // We are done, now the main program starts
      default:
        break loop;
    }
  }
  return comments;
}

/**
 * From
 * https://github.com/microsoft/TypeScript/blob/b58ac4abf2d58d6309274c22762e2196789476d9/src/compiler/parser.ts#L10675
 * 
 * Extracts a comment pragma from a comment text. Only considers
 * triple-slash XML references, as we need only those for the plugin.
 *
 * @param {string} code The source code.
 * @param {EcmaScriptComment} comment A comment in the source code to extract the pragma from.
 * @returns {TypeScriptPragma | undefined}
 */
function extractPragma(code, comment) {
  const text = code.slice(comment.start, comment.end);

  const tripleSlash = comment.type === "single" ? TripleSlashXMLCommentStartRegEx.exec(text) : undefined;
  if (tripleSlash) {
    const name = tripleSlash[1].toLowerCase();
    const pragma = CommentPragmas[name];
    if (pragma?.kind !== "TripleSlashXML") {
      return undefined;
    }
    if (!pragma.args) {
      return { name, args: {}, type: "TripleSlashXML" };
    }

    /** @type {Record<string, string>} */
    const args = {};
    for (const arg of pragma.args) {
      const matcher = getNamedArgRegEx(arg.name);
      const matchResult = matcher.exec(text);
      if (!matchResult && !arg.optional) {
        return; // Missing required argument, don't parse
      }
      else if (matchResult) {
        const value = matchResult[2] || matchResult[3];
        args[arg.name] = value;
      }
    }
    return { name, args, type: "TripleSlashXML" };
  }

  // cases for single and multi-line pragmas omitted since we don't need them

  return undefined;
}

/**
 * Finds all comment pragmas in the given TypeScript / JavaScript code,
 * and returns them. Includes details about their source code location.
 * @implNote For now, only `TripleSlashXML` pragmas are returned,
 * as we only need those for now.
 * @param {string} code 
 * @returns {TypeScriptCommentPragma[]}
 */
export function getAllCommentPragmas(code) {
  const comments = consumeEcmaScriptProgramHeader(code);
  return comments.map(comment => {
    const pragma = extractPragma(code, comment);
    return pragma !== undefined ? { comment, pragma } : undefined;
  }).filter(x => x !== undefined);
}
