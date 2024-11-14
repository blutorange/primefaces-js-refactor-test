// package: core.js

import { BaseWidget as _BaseWidget, BaseWidgetCfg as _BaseWidgetCfg } from "./src/BaseWidget";
import { DeferredWidget as _DeferredWidget, DeferredWidgetCfg as _DeferredWidgetCfg } from "./src/DeferredWidget";

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

