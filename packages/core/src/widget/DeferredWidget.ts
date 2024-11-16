import { BaseWidget, type BaseWidgetCfg } from "./BaseWidget.js";

export interface DeferredWidgetCfg extends BaseWidgetCfg {
    id: string;
}

export abstract class DeferredWidget extends BaseWidget {
    rendered: boolean;
    constructor(cfg: BaseWidgetCfg, runInit = true) {
        super(cfg, runInit);
        this.rendered = false;
    }

    override  render(): void {
        // something
    }

    protected abstract _render(): void;
}