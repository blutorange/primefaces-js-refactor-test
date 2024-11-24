import { InputText } from "./src/InputText.js";
import { InputTextArea } from "./src/InputTextArea.js";

declare global {
    namespace PrimeType {
        export interface WidgetRegistry {
            InputText: typeof InputText;
            InputTextArea: typeof InputTextArea;
        }
    }
    namespace PrimeType.widget {
        export type InputTextCfg = import("./src/InputText.js").InputTextCfg;
        export type InputTextAreaCfg = import("./src/InputTextArea.js").InputTextAreaCfg;
    }
}

// @ts-expect-errors
(window.PrimeFaces ??= {}).widget ??= {};
PrimeFaces.widget.InputText = InputText;
PrimeFaces.widget.InputTextArea = InputTextArea;