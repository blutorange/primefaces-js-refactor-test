import type { Signature } from "./signature-widget.js";

declare module "primefaces-core" {
    interface WidgetRegistry {
        Signature: typeof Signature
    }
}
