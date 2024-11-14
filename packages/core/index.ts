// package: core.js

import { BaseWidget as _BaseWidget, type BaseWidgetCfg as _BaseWidgetCfg } from "./src/BaseWidget.js";
import { DeferredWidget as _DeferredWidget, type DeferredWidgetCfg as _DeferredWidgetCfg } from "./src/DeferredWidget.js";

declare global {
    namespace PrimeType.widget {
        export type BaseWidgetCfg = _BaseWidgetCfg;
        export type DeferredWidgetCfg = _DeferredWidgetCfg;
        export interface WidgetRegistry {
            BaseWidget: typeof _BaseWidget;
            DeferredWidget: typeof _DeferredWidget;
        }
    }
}

// @ts-expect-error
(window.PrimeFaces ??= {}).widget ??= {};
PrimeFaces.widget.BaseWidget ??= _BaseWidget;
PrimeFaces.widget.DeferredWidget ??= _DeferredWidget;

