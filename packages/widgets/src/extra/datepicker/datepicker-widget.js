/** @import { DatePickerCfg } from "./datepicker-types.js" */

/**
 * @template {DatePickerCfg} [Cfg=DatePickerCfg]
 * @extends {PrimeFaces.widget.DeferredWidget<Cfg>}
 */
export class DatePicker extends PrimeFaces.widget.DeferredWidget {
  /**
   * @param {Cfg} cfg 
   */
  constructor(cfg) {
    super(cfg);
    this.type = "date-picker";
  }
}