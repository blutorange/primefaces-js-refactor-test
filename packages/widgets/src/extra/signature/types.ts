import type { BaseWidgetCfg } from "primefaces-core";
import type { Signature } from "./signature-widget.js";

export interface SignatureCfg extends BaseWidgetCfg {
    strokeColor?: string;
}

declare module "primefaces-core" {
    interface WidgetRegistry {
        Signature: typeof Signature
    }
}
