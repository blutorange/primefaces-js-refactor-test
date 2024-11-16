namespace PrimeType {
    export type ToJQueryUIWidgetReturnType<W, R, JQ> = R extends W | undefined | void ? JQ : R extends undefined | void ? R | JQ : R;

    export namespace widget {
    }

    export interface WindowExtensions {
        // PrimeFaces: typeof PrimeFaces;
    }
}

namespace PrimeFaces {
    export namespace widget { }
}

interface Window extends PrimeType.WindowExtensions {
}
