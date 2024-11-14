// package: components.js

import { InputTextArea, type InputTextAreaCfg as _InputTextAreaCfg } from "./src/InputTextArea.js";

declare global {
    namespace PrimeType.widget {
        export type InputTextAreaCfg = _InputTextAreaCfg;
        export interface WidgetRegistry {
            InputTextArea: typeof InputTextArea;
        }
    }
}

// @ts-expect-error
(window.PrimeFaces ??= {}).widget ??= {};
PrimeFaces.widget.InputTextArea ??= InputTextArea;
