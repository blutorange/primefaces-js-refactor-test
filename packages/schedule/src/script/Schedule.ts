namespace PrimeType.widget {
    export interface ScheduleCfg extends PrimeType.widget.DeferredWidgetCfg {
        id: string;
    }
}
namespace PrimeFaces.widget {
    export class Schedule extends PrimeFaces.widget.DeferredWidget {
        readonly scheduleId: string;
        calendar: import("@fullcalendar/core").Calendar | undefined;
    
        constructor(cfg: PrimeType.widget.ScheduleCfg) {
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
