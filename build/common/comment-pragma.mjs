import fsSync from "node:fs";
import { StringDecoder } from "node:string_decoder";

/**
 * Interface for reading Unicode character codes one by one from a source.
 * @typedef {{
* eof: boolean;
* pos: number;
* text: (from: number, to: number) => string;
* next: () => number;
* }} CharCodeReader
*/
undefined;

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
 * readonly text: string;
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
 * readonly text: string;
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
 * readonly text: string;
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

const CharExclamation = "!".charCodeAt(0);
const CharSlash = "/".charCodeAt(0);
const CharStar = "*".charCodeAt(0);

const BufferSize = 2048;

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
  0x0009: "ws",
  0x000B: "ws",
  0x000C: "ws",
  0xFEFF: "ws",
  0x0020: "ws",
  0x00A0: "ws",
  0x1680: "ws",
  0x2000: "ws",
  0x2001: "ws",
  0x2002: "ws",
  0x2003: "ws",
  0x2004: "ws",
  0x2005: "ws",
  0x2006: "ws",
  0x2007: "ws",
  0x2008: "ws",
  0x2009: "ws",
  0x200A: "ws",
  0x202F: "ws",
  0x205F: "ws",
  0x3000: "ws",
  0x000A: "line",
  0x000D: "line",
  0x2028: "line",
  0x2029: "line",
  0x0023: "hash",
  0x002F: "slash",
};

/**
 * Creates a character code reader that reads from a string in memory.
 * @param {string} text
 * @returns {CharCodeReader}
 */
function createTextCharCodeReader(text) {
  /** @type {CharCodeReader} */
  const reader = {
    eof: false,
    pos: 0,
    text: (from, to) => text.slice(from, to),
    next: () => {
      if (reader.eof) {
        return -1;
      }
      if (reader.pos >= text.length) {
        reader.eof = true;
        return -1;
      }
      return text.charCodeAt(reader.pos++);
    },
  };
  return reader;
}

/**
 * Creates a character code reader that reads from a file, but only
 * on demand as more data is needed.
 * @param {string} filePath Path to the file to read.
 * @returns {Promise<CharCodeReader & Disposable>} A character code reader that reads from the file.
 */
async function createFileCharCodeReader(filePath) {
  return new Promise((resolve, reject) => {
    fsSync.open(filePath, "r", async (err, fd) => {
      if (err) {
        reject(err);
        return;
      }

      const decoder = new StringDecoder("utf8");
      const buffer = Uint8Array.from({ length: BufferSize });

      /** @type {string[]} */
      let chunks = [];
      /** @type {string} */
      let chunk = "";
      let chunkPos = 0;

      /** @type {CharCodeReader & Disposable} */
      const reader = {
        eof: false,
        pos: 0,
        [Symbol.dispose]: () => {
          fsSync.closeSync(fd);
        },
        next: () => {
          if (reader.eof) {
            return -1;
          }
          if (chunkPos >= chunk.length) {
            chunkPos = 0;
            do {
              const bytesRead = fsSync.readSync(fd, buffer);
              if (bytesRead === 0) {
                reader.eof = true;
                return -1;
              }
              chunk = decoder.write(buffer.slice(0, bytesRead));
              chunks.push(chunk);
            } while (chunk.length === 0);
          }
          reader.pos++;
          return chunk.charCodeAt(chunkPos++);
        },
        text: (from, to) => {
          let index = 0;
          /** @type {string[] | undefined} */
          let result;
          for (const chunk of chunks) {
            const end = index + chunk.length;
            if (from >= index && from < end) {
              if (to > index && to <= end) {
                return chunk.slice(from - index, to - index);
              }
              result ??= [];
              result.push(chunk.slice(from - index));
            } else if (result) {
              if (to > index && to <= end) {
                result.push(chunk.slice(0, to - index));
                break;
              } else {
                result.push(chunk);
              }
            }
            index = end;
          }
          return result?.join("") ?? "";
        },
      };

      resolve(reader);
    });
  });
}

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
 * @param {CharCodeReader} reader
 */
function consumeSingleLineCommentChars(reader) {
  let char;
  while (char = reader.next(), char !== -1 && EcmaScriptTokenTypes[char] !== "line");
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
 * @param {CharCodeReader} reader 
 */
function consumeMultiLineCommentChars(reader) {
  let last = -1;
  let char;
  while (char = reader.next(), char !== -1) {
    // Keep discarding comments, until we get to '*/', which ends the comment
    if (last === CharStar && char === CharSlash) {
      return;
    }
    last = char;
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
 * @param {CharCodeReader} reader
 * @param {EcmaScriptComment[]} comments
 */
function consumeHashBang(reader, comments) {
  const start = reader.pos - 1;
  if (reader.next() !== CharExclamation) {
    throw new Error(`Expected bang character (!) at position ${reader.pos - 1}`);
  }
  consumeSingleLineCommentChars(reader);
  comments.push({ type: "hash-bang", start, end: reader.pos, text: reader.text(start, reader.pos - 1) });
}

/**
 * https://tc39.es/ecma262/#prod-SingleLineComment
 *
 * ```
 * SingleLineComment ::
 *     </> </> SingleLineCommentChars[opt]
 * ```
 * @param {CharCodeReader} reader 
 * @param {EcmaScriptComment[]} comments
 */
function consumeSingleLineComment(reader, comments) {
  const start = reader.pos - 2;
  consumeSingleLineCommentChars(reader);
  comments.push({ type: "single", start, end: reader.pos, text: reader.text(start, reader.pos - 1) });
}

/**
 * https://tc39.es/ecma262/#prod-MultiLineComment
 * 
 * ```
 * MultiLineComment ::
 * </> <*> MultiLineCommentChars[opt] <*> </>
 * ```
 * @param {CharCodeReader} reader 
 * @param {EcmaScriptComment[]} comments
 */
function consumeMultiLineComment(reader, comments) {
  const start = reader.pos - 2;
  consumeMultiLineCommentChars(reader);
  comments.push({ type: "multi", start, end: reader.pos, text: reader.text(start, reader.pos) });
}

/**
 * https://tc39.es/ecma262/#prod-Comment
 *
 * ```
 * Comment ::
 *     MultiLineComment
 *     SingleLineComment
 * ```
 * @param {CharCodeReader} reader
 * @param {EcmaScriptComment[]} comments
 */
function consumeComment(reader, comments) {
  switch (reader.next()) {
    case CharSlash:
      return consumeSingleLineComment(reader, comments);
    case CharStar:
      return consumeMultiLineComment(reader, comments);
    default:
      throw new Error(`Expected slash (/) or star (*) character at position ${reader.pos - 1}`);
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
 * @param {CharCodeReader} reader Code to parse for comments.
 * @returns {EcmaScriptComment[]} Comments that appear before the program.
 */
function consumeEcmaScriptProgramHeader(reader) {
  /** @type {EcmaScriptComment[]} */
  const comments = [];
  /** @type {number|undefined} */
  let char;
  let hasBom = false;
  loop: while (char = reader.next(), char !== -1) {
    hasBom &&= reader.pos === 1 && char === 0xFEFF;
    switch (EcmaScriptTokenTypes[char]) {
      case "line":
      case "ws":
        break;
      case "hash":
        if (!(reader.pos === 1 || hasBom && reader.pos === 2)) {
          throw new Error("Hash bang (#!) must appear at the beginning of the file.");
        }
        consumeHashBang(reader, comments);
        break;
      case "slash":
        consumeComment(reader, comments);
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
 * @param {EcmaScriptComment} comment A comment in the source code to extract the pragma from.
 * @returns {TypeScriptPragma | undefined}
 */
function extractPragma(comment) {
  const text = comment.text;

  const tripleSlash = comment.type === "single" ? TripleSlashXMLCommentStartRegEx.exec(text) : undefined;
  if (tripleSlash) {
    const name = /** @type {string} */(tripleSlash[1]).toLowerCase();
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
        args[arg.name] = value ?? "";
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
 * @param {CharCodeReader} reader Content of a TypeScript / JavaScript file.
 * @returns {TypeScriptCommentPragma[]}
 */
function getAllCommentPragmas(reader) {
  const comments = consumeEcmaScriptProgramHeader(reader);
  return comments
    .map(comment => {
      const pragma = extractPragma(comment);
      return pragma !== undefined ? { comment, pragma } : undefined;
    })
    .filter(x => x !== undefined);
}

/**
 * Finds all comment pragmas in the given TypeScript / JavaScript code,
 * and returns them. Includes details about their source code location.
 * @implNote For now, only `TripleSlashXML` pragmas are returned,
 * as we only need those for now.
 * @param {string} code Content of a TypeScript / JavaScript file.
 * @returns {TypeScriptCommentPragma[]}
 */
export function getAllCommentPragmasFromText(code) {
  return getAllCommentPragmas(createTextCharCodeReader(code));
}

/**
 * Finds all comment pragmas in the given TypeScript / JavaScript code,
 * and returns them. Includes details about their source code location.
 * @implNote For now, only `TripleSlashXML` pragmas are returned,
 * as we only need those for now.
 * @param {string} filePath Path to a TypeScript / JavaScript file.
 * @returns {Promise<TypeScriptCommentPragma[]>}
 */
export async function getAllCommentPragmasFromFile(filePath) {
  const reader = await createFileCharCodeReader(filePath);
  try {
    return getAllCommentPragmas(reader);
  } finally {
    reader[Symbol.dispose]();
  }
}
