import * as FullCalendarCore from "@fullcalendar/core";
import * as FullCalendarInteraction from "@fullcalendar/interaction";

type FullCalendarGlobal =
    & typeof import("@fullcalendar/core")
    & typeof import("@fullcalendar/interaction");

const FullCalendarGlobalImpl: FullCalendarGlobal = {
    ...FullCalendarCore,
    ...FullCalendarInteraction,
};

declare global {
    const FullCalendar: FullCalendarGlobal;
    interface Window {
        FullCalendar: typeof FullCalendar;
    }
}

Object.assign(window, { FullCalendar: FullCalendarGlobalImpl });
