namespace PrimeFaces.widget {
    export interface DeferredWidgetCfg extends BaseWidgetCfg {
        id: string;
    }

    export abstract class DeferredWidget extends BaseWidget {
        rendered: boolean;
        constructor(cfg: BaseWidgetCfg) {
            super(cfg);
            this.rendered = false;
        }

        abstract _render(): void;
    }
}
