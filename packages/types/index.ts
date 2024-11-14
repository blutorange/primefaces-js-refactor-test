declare global {
    namespace PrimeType {
        export type ToJQueryUIWidgetReturnType<W, R, JQ> = R extends W | undefined | void ? JQ : R extends undefined | void ? R | JQ : R;
        export namespace widget {
            export interface WidgetRegistry {
            }
        }
        export interface WindowExtensions {
            PrimeFaces: typeof PrimeFaces;
        }
    }

    interface PrimeFaces {
        widget: PrimeType.widget.WidgetRegistry;
    }
    
    interface Window extends PrimeType.WindowExtensions { }
 
    let PrimeFaces: PrimeFaces;
}

export { };
