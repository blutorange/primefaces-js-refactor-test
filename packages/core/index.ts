// package: core.js
/// <reference path="./src/BaseWidget.ts" />
/// <reference path="./src/DeferredWidget.ts"  />

namespace PrimeFaces {
    export interface WindowExtensions {
        /**
         * Exposes the main PrimeFaces namespace that contains all features.
         * to the global window scope.
         * See {@link PrimeFaces}.
         */
        PrimeFaces: typeof PrimeFaces;
    }
}