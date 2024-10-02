/** @import { SelectOneMenuCfg } from "./select-one-menu-types.js" */

/**
 * The select one menu widget.
 * @template {SelectOneMenuCfg} [Cfg=SelectOneMenuCfg]
 * @extends {PrimeFaces.widget.BaseWidget<Cfg>}
 */
export class SelectOneMenu extends PrimeFaces.widget.BaseWidget {
  /**
   * @param {Cfg} cfg 
   */
  constructor(cfg) {
    super(cfg);
    this.type = "select-one-menu";
  }
}