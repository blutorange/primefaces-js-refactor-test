import type { SelectOneMenu } from "./select-one-menu.js";

declare module "primefaces-core" {
    interface WidgetRegistry {
        SelectOneMenu: typeof SelectOneMenu
    }
}