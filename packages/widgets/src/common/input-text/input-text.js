/** @import { InputTextCfg } from "./types.js" */

/**
 * The select one menu widget.
 * @template {InputTextCfg} Cfg
 * @extends {PrimeFaces.widget.BaseWidget<Cfg>}
 */
export class InputText extends PrimeFaces.widget.BaseWidget {
  /**
   * @param {Cfg} cfg 
   */
  constructor(cfg) {
    super(cfg);
    this.type = "input-text";
  }
}
