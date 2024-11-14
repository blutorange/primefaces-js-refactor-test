import { Calendar } from "@fullcalendar/core";

export interface ScheduleCfg extends PrimeType.widget.DeferredWidgetCfg {
    id: string;
}

export class Schedule extends PrimeFaces.widget.DeferredWidget {
    readonly scheduleId: string;
    calendar: Calendar | undefined;

    constructor(cfg: ScheduleCfg) {
        super(cfg);
        this.scheduleId = "";
    }

    _render(): void {
        this.calendar = new Calendar(document.getElementById(this.scheduleId)!, {});
    }

    getCalendar(): Calendar | undefined {
        return this.calendar;
    }
}