import type { InputText } from "./input-text.js";

declare module "primefaces-core" {
    interface WidgetRegistry {
        InputText: typeof InputText
    }
}