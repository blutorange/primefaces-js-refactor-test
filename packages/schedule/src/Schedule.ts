namespace PrimeFaces.widget {
    export interface ScheduleCfg {
        id: string;
    }

    export class Schedule extends DeferredWidget {
        readonly scheduleId: string;
        calendar: import("@fullcalendar/core").Calendar | undefined;

        constructor(cfg: ScheduleCfg) {
            super(cfg);
            this.scheduleId = "";
        }

        _render(): void {
            this.calendar = new FullCalendar.Calendar(document.getElementById(this.scheduleId)!, {});
        }

        getCalendar(): import("@fullcalendar/core").Calendar | undefined {
            return this.calendar;
        }
    }
}
