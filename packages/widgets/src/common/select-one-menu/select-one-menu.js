/** @import { SelectOneMenuCfg } from "./types.js" */

/**
 * The select one menu widget.
 * @template {SelectOneMenuCfg} Cfg
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