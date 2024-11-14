// package: components.js

import { InputTextArea as _InputTextArea, InputTextAreaCfg as _InputTextAreaCfg } from "./src/InputTextArea.js";

declare global {
    namespace PrimeType.widget {
        export type InputTextAreaCfg = _InputTextAreaCfg;
        export interface WidgetRegistry {
            InputTextArea: typeof _InputTextArea;
        }
    }
}

// @ts-expect-error
(window.PrimeFaces ??= {}).widget ??= {};
PrimeFaces.widget.InputTextArea ??= _InputTextArea;
