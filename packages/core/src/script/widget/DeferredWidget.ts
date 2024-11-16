/// <reference path="./BaseWidget.ts" />

namespace PrimeType.widget {
    export interface DeferredWidgetCfg extends PrimeType.widget.BaseWidgetCfg {
        id: string;
    }
}

namespace PrimeFaces.widget {
    export abstract class DeferredWidget extends PrimeFaces.widget.BaseWidget {
        rendered: boolean;
        constructor(cfg: PrimeType.widget.BaseWidgetCfg, runInit = true) {
            super(cfg, runInit);
            this.rendered = false;
        }
    
        override  render(): void {
            // something
        }
    
        protected abstract _render(): void;
    }
}
