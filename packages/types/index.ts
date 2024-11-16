declare global {
    namespace PrimeType {
        export type ToJQueryUIWidgetReturnType<W, R, JQ> = R extends W | undefined | void ? JQ : R extends undefined | void ? R | JQ : R;
    
        export interface WidgetRegistry {

        }
    
        export interface WindowExtensions {
            PrimeFaces: PrimeFaces;
        }

        export interface PrimeFaces {
            widget: WidgetRegistry;
        }
    }

    
    let PrimeFaces: PrimeType.PrimeFaces;
    
    interface Window extends PrimeType.WindowExtensions {}
}

export {}