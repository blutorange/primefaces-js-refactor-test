import type { WidgetRegistry } from "primefaces-core";
import type { InputText, SelectOneMenu } from "./common/types.js";
import type { DatePicker, Signature } from "./extra/types.js";

/**
 * Extension for the {@link WidgetRegistry}, available via `PrimeFaces.widget`.
 */
export interface WidgetRegistryExtension{
    /**
     * The `InputText` widget.
     */
    InputText: typeof InputText;
    /**
     * The `SelectOneMenu` widget.
     */
    SelectOneMenu: typeof SelectOneMenu;
    /**
     * The `DatePicker` widget.
     */
    DatePicker: typeof DatePicker;
    /**
     * The `Signature` widget.
     */
    Signature: typeof Signature;
}
