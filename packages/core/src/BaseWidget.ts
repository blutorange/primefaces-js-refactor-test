export interface BaseWidgetCfg {
    id: string;
}

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
