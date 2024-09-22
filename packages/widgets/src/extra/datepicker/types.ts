import type { BaseWidgetCfg } from "primefaces-core";
import type { DatePicker } from "./datepicker.js";

export interface DatePickerCfg extends BaseWidgetCfg {
    showTime?: boolean;
}

declare module "primefaces-core" {
    interface WidgetRegistry {
        DatePicker: typeof DatePicker
    }
}