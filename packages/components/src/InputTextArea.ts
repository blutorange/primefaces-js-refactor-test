namespace PrimeFaces.widget {
    export interface InputTextAreaCfg extends BaseWidgetCfg {
        id: string;
        resize: boolean;
    }

    export class InputTextArea extends BaseWidget {
        readonly input: string;
        constructor(cfg: InputTextAreaCfg) {
            super(cfg);
            this.input = "textarea";
        }

        resize() {
        }

        override render(): void {
            this.jq.animate({ opacity: 0 }, 500);
        }
    }
}
