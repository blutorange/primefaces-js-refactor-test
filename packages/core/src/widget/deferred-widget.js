/** @import {DeferredWidgetCfg} from "./config.js" */

import { BaseWidget } from "./base-widget.js";

/**
 * The deferred widget.
 * @template {DeferredWidgetCfg} Cfg
 * @extends {BaseWidget<Cfg>}
 */
export class DeferredWidget extends BaseWidget {
    /**
     * @param {Cfg} cfg 
     */
    constructor(cfg) {
        super(cfg);
        this.name = 'DeferredWidget';
    }
    
    render() {
        return `<div>${this.name}</div>`;
    }

    _render() {
        return `<div>${this.name}</div>`;
    }
}