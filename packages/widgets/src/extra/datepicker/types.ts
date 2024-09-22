import type { DatePicker } from "./datepicker.js";

declare module "primefaces-core" {
    interface WidgetRegistry {
        DatePicker: typeof DatePicker
    }
}