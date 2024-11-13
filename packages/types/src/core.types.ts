/**
 * The main namespace with all features of PrimeFaces.
 */
declare namespace PrimeFaces {
    /**
     * Interface with all extensions to the global window scope
     * that are provided by PrimeFaces.
     */
    export interface WindowExtensions { }

    /**
     * Registry for all widget types. If you write custom
     * widgets, they must be registered here.
     */
    export namespace widget {
    }

    /**
     * Namespace with various helper types that are needed
     * by other parts of the PrimeFaces library.
     */
    export namespace CoreTypes {
        /**
         * Maps the return type of a method of an instance method of a JQueryUI widget instance to the return type of the
         * JQueryUI wrapper:
         * - When an instance method returns `undefined` or the instance itself, the JQuery instance is returned.
         * - Otherwise, the value of the instance method is returned.
         * @typeParam W Type of the widget instance.
         * @typeParam R Type of a value returned by a widget instance method.
         * @typeParam JQ Type of the JQuery instance.
         * @return The type that is returned by the JQueryUI wrapper method.
         */
        export type ToJQueryUIWidgetReturnType<W, R, JQ> =
            // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
            R extends W | undefined | void ? JQ : R extends undefined | void ? R | JQ : R;

    }
}
