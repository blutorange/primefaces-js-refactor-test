export interface InputTextCfg extends PrimeType.widget.BaseWidgetCfg {
    id: string;
    resize: boolean;
}

export class InputText extends PrimeFaces.widget.BaseWidget {
    readonly input: string;
    constructor(cfg: InputTextCfg) {
        super(cfg);
        this.input = "textarea";
    }

    focus(): void {
        this.jq.focus();
    }

    override render(): void {
        this.jq.animate({ opacity: 0 }, 500);
    }
}