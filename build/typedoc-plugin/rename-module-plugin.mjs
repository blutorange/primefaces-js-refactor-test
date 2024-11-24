/** @import { Application } from "typedoc" */

import { Converter, ReflectionKind } from "typedoc";
import { substringBeforeFirst } from "../lang/string.mjs";

/**
 * Plugin for TypeDoc that renames modules for better groping. By default,
 * every source file would result in a separate module, which is not very
 * helpful for the documentation, and also exposes the internal structure
 * unnecessarily.
 * 
 * Instead, this plugin uses the name of the sub project containing the
 * source file.
 * 
 * @param {Application} app 
 */
export function load(app) {
    app.converter.on(
        Converter.EVENT_CREATE_DECLARATION,
        (_, reflection) => {
            if (reflection.kind === ReflectionKind.Module) {
                reflection.name = substringBeforeFirst(reflection.name, "/");
            }
        },
    );
}
