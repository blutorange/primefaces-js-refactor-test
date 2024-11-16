/** @import { Application, DeclarationReflection } from "typedoc" */

import { Converter, ReflectionKind } from "typedoc";

/** @param {DeclarationReflection} declaration */
function hackInheritance(declaration) {
    if (!declaration.extendedTypes) {
        return;
    }

    for (let i = 0; i < declaration.extendedTypes.length; ++i) {
        const type = declaration.extendedTypes[i];
        if (type === undefined) {
            continue;
        }
        if (type.type !== "reference") {
            continue;
        }
        if (!type.reflection) {
            continue;
        }
        
        const target = /** @type {DeclarationReflection} */(type.reflection);
        
        if (target.kindOf(ReflectionKind.ClassOrInterface)) {
            continue;
        }
        
        const targetType = target.type;
        if (targetType === undefined || targetType.type !== "query") {
            continue;
        }
        if (!targetType.queryType.reflection?.kindOf(ReflectionKind.ClassOrInterface)) {
            continue;
        }

        // We inherit from a property somewhere which is declared as `typeof SomeClass`
        // So re-point the inheritance to SomeClass
        declaration.extendedTypes[i] = targetType.queryType;
    }
}

/**
 * Plugin for TypeDoc to handle `typeof` class inheritance. When `X` is
 * a class, `A = X` is a variable assigned to the class with a declared
 * type of `typeof X`, and another class uses `A` as a base class, then
 * TypeDoc will not resolve the class hierarchy correctly. For example,
 * 
 * ```ts
 * class X {}
 * 
 * interface Registry {
 *   X: typeof X;
 * }
 * declare const registry: Registry;
 * 
 * class Y extends registry.X {}
 * ```
 * 
 * This plugin scans for such cases where a class has an expression
 * in its extends clause. If it finds the type of the expression is
 * `typeof X`, it replaces the extends clause with `X`. This way,
 * the class hierarchy is correctly resolved.
 * 
 * See also:
 * https://github.com/TypeStrong/typedoc/issues/2775
 * 
 * @param {Application} app 
 */
export function load(app) {
    app.converter.on(
        Converter.EVENT_RESOLVE_BEGIN,
        (context) => {
            for (const decl of context.project.getReflectionsByKind(ReflectionKind.ClassOrInterface)) {
                hackInheritance(/** @type {DeclarationReflection} */(decl));
            }
        },
        1e6,
    );
}
