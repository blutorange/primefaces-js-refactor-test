import type { BaseWidget } from "./base-widget.js";
import type { DeferredWidget } from "./deferred-widget.js";

export interface WidgetRegistry {   
    BaseWidget: typeof BaseWidget,
    DeferredWidget: typeof DeferredWidget,
}