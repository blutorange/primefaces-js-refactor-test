namespace PrimeFaces.widget {
    export interface BaseWidgetCfg {
        id: string;
    }

    export abstract class BaseWidget {
        readonly cfg: BaseWidgetCfg;
        jq: JQuery;

        constructor(cfg: BaseWidgetCfg) {
            this.cfg = cfg;
            this.jq = $();
        }

        destroy() {
        }

        render(): void {}
    }
}
