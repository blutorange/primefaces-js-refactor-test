/** @import { JsonArray, JsonObject, JsonValue } from "type-fest" */

/**
 * Visitor for the nodes in a JSON tree. All callbacks are optional.
 * @typedef {{
 * object?: (obj: JsonObject) => void;
 * objectEntry?: (key: string, value: JsonValue, obj: JsonObject) => void;
 * array?: (arr: JsonArray) => void;
 * arrayElement?: (element: JsonValue, arr: JsonArray) => void;
 * string?: (str: string) => void;
 * number?: (num: number) => void;
 * boolean?: (bool: boolean) => void;
 * null?: () => void;
 * }} JsonVisitor
 */
undefined;

/**
 * Walks over a JSON tree and calls the visitor for each node in the JSON tree.
 * @param {JsonValue} obj JSON tree to walk.
 * @param {JsonVisitor} visitor Visitor to call for each node in the JSON tree.
 */
export function walkJson(obj, visitor) {
    /** @type {(obj: JsonValue) => void} */
    const walk = (obj) => {
        if (obj === null) {
            visitor.null?.();
        } else if (Array.isArray(obj)) {
            visitor.array?.(obj);
            for (const element of obj) {
                visitor.arrayElement?.(element, obj);
                walk(element);
            }
        } else if (typeof obj === "object") {
            visitor.object?.(/** @type {JsonObject} */(obj));
            for (const key in obj) {
                // @ts-expect-error
                const value = /** @type {JsonValue} */ (obj[key]);
                visitor.objectEntry?.(key, value, /** @type {JsonObject} */(obj));
                walk(value);
            }
        } else if (typeof obj === "string") {
            visitor.string?.(obj);
        } else if (typeof obj === "number") {
            visitor.number?.(obj);
        } else if (typeof obj === "boolean") {
            visitor.boolean?.(obj);
        }
    };
    walk(obj);
}
