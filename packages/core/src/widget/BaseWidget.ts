// declare global {
//     namespace PrimeType.widget {
//     }
// }
export interface BaseWidgetCfg {
    id: string;
}

/**
 * The base class for all PrimeFaces widgets.
 */
export class BaseWidget {
    readonly cfg: BaseWidgetCfg;
    jq: JQuery;

    constructor(cfg: BaseWidgetCfg, runInit = true) {
        this.cfg = cfg;
        this.jq = $();
        if (runInit) {
            this.init();
        }
    }

    init(): void {
    }

    destroy(): void {
    }

    render(): void { }
}