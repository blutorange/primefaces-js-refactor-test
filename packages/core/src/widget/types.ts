import type { BaseWidget } from "./base-widget.js";
import type { DeferredWidget } from "./deferred-widget.js";

export type * from "./base-widget.js";
export type * from "./deferred-widget.js";

export interface BaseWidgetCfg {
    id: string;
}

export interface DeferredWidgetCfg extends BaseWidgetCfg {
    minimumDelay?: number;
}

export interface WidgetRegistry {   
    BaseWidget: typeof BaseWidget,
    DeferredWidget: typeof DeferredWidget,
}