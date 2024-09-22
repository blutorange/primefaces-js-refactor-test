/** @import { BaseWidgetCfg } from "./types.js" */

/**
 * The base widget.
 * @template {BaseWidgetCfg} Cfg
 */
export class BaseWidget {
    /**
     * @param {Cfg} cfg 
     */
    constructor(cfg) {
        this.name = 'BaseWidget';
        this.cfg = cfg;
    }

    render() {
        return `<div>${this.name}</div>`;
    }
}