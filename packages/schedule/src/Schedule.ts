namespace PrimeFaces.widget {
    export interface ScheduleCfg {
        id: string;
    }

    export class Schedule extends DeferredWidget {
        readonly scheduleId: string;

        constructor(cfg: ScheduleCfg) {
            super(cfg);
            this.scheduleId = "";
        }

        _render(): void {
            new FullCalendar.Calendar(document.getElementById(this.scheduleId)!, {});
        }
    }
}
