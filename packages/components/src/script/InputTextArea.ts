namespace PrimeType.widget {
    export interface InputTextAreaCfg extends PrimeType.widget.BaseWidgetCfg {
        id: string;
        resize: boolean;
    }
}

namespace PrimeFaces.widget {
    export class InputTextArea extends PrimeFaces.widget.BaseWidget {
        readonly input: string;
        constructor(cfg: PrimeType.widget.InputTextAreaCfg) {
            super(cfg);
            this.input = "textarea";
        }

        resize(): HTMLElement | undefined {
            return document.getElementById(this.input) ?? undefined;
        }

        override render(): void {
            this.jq.animate({ opacity: 0 }, 500);
        }
    }
}
