/** @import { InputTextCfg } from "./input-text-types.js" */

/**
 * The select one menu widget.
 * @template {InputTextCfg} [Cfg=InputTextCfg]
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
