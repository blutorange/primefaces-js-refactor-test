/**
 * Defines a replacement for a string.
 * - `start` is the start index of the range in the string to replace (inclusive).
 * - `end` is the end index of the the range in the string to replace (exclusive).
 * - `value` is the replacement value.
 * @typedef {{
 * readonly start: number;
 * readonly end: number;
 * readonly value: string | string[];
 * }} StringReplacement
 */
undefined;

/**
 * Applies all replacements to the given value and returns the result.
 * The replacements must not have any overlap.
 * @param {string} value Value to apply the replacements to. 
 * @param {StringReplacement[]} replacements Replacements to apply to the value.
 * @returns {string} The value with the replacements applied.
 */
export function applyStringReplacements(value, replacements) {
    // No replacements, return the original code
    if (replacements.length === 0) {
        return value;
    }

    // Ensure we process the replacements in order
    replacements.sort((a, b) => a.start - b.start);

    /** @type {string[]} */
    const replaced = [];
    let last = 0;
    for (const replacement of replacements) {
        // Append the code after the last replacement and before the current replacement
        replaced.push(value.slice(last, replacement.start));
        // Append the replacement
        if (Array.isArray(replacement.value)) {
            replaced.push(...replacement.value);
        } else {
            replaced.push(replacement.value);
        }
        last = replacement.end;
    }
    // Append the code after the last replacement
    if (last < value.length) {
        replaced.push(value.slice(last));
    }

    return replaced.join("");
}
