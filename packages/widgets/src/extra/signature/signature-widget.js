/** @import { SignatureCfg } from "./signature-types.js" */

/**
 * @template {SignatureCfg} [Cfg=SignatureCfg]
 * @extends {PrimeFaces.widget.BaseWidget<Cfg>}
 */
export class Signature extends PrimeFaces.widget.BaseWidget {
  /**
   * @param {Cfg} cfg 
   */
  constructor(cfg) {
    super(cfg);
    this.type = "signature";
  }
}