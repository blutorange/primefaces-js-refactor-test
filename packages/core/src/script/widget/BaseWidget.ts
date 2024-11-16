namespace PrimeType.widget {
    export interface BaseWidgetCfg {
        id: string;
    }
}

namespace PrimeFaces.widget {
    /**
     * The base class for all PrimeFaces widgets.
     */
    export class BaseWidget {
        readonly cfg: PrimeType.widget.BaseWidgetCfg;
        jq: JQuery;

        constructor(cfg: PrimeType.widget.BaseWidgetCfg, runInit = true) {
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
}
