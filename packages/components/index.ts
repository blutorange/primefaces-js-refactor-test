import { InputTextArea } from "./src/InputTextArea.js";

declare global {
    namespace PrimeType {
        export interface WidgetRegistry {
            InputTextArea: typeof InputTextArea;
        }
    }
    namespace PrimeType.widget {
        export type InputTextAreaCfg = import("./src/InputTextArea.js").InputTextAreaCfg;
    }
}

// @ts-expect-errors
(window.PrimeFaces ??= {}).widget ??= {};
PrimeFaces.widget.BaseWidget = InputTextArea;