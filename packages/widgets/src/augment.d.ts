import type { WidgetRegistryExtension } from "./widget-registry-extension.js";

export * from "./types.js";

declare module "primefaces-core" {
    interface WidgetRegistry extends WidgetRegistryExtension {}
}
