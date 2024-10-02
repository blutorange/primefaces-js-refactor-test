import type { WidgetRegistryExtension } from "./widget-registry-extension.js";

declare module "primefaces-core" {
    interface WidgetRegistry extends WidgetRegistryExtension {}
}
