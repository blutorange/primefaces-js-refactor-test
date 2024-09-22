import type { InputText } from "./input-text/input-text.js";
import type { SelectOneMenu } from "./select-one-menu/select-one-menu.js";

export type * from "./input-text/types.js";
export type * from "./select-one-menu/types.js";

declare module "primefaces-core" {
    interface WidgetRegistry {
        InputText: typeof InputText;
        SelectOneMenu: typeof SelectOneMenu;
    }
}