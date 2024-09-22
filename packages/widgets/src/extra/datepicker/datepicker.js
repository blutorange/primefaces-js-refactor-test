/** @import { DatePickerCfg } from "./types.js" */

/**
 * @template {DatePickerCfg} Cfg
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