import * as FullCalendarCore from "@fullcalendar/core";
import * as FullCalendarInteraction from "@fullcalendar/interaction";
import * as FullCalendarDayGrid from "@fullcalendar/daygrid";
import * as FullCalendarTimeGrid from "@fullcalendar/timegrid";
import * as FullCalendarList from "@fullcalendar/list";
import * as FullCalendarMoment from "@fullcalendar/moment";
import * as FullCalendarMomentTimeZone from "@fullcalendar/moment-timezone";
import FullCalendarCoreLocalesAll from "@fullcalendar/core/locales-all.js"

import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import momentPlugin from "@fullcalendar/moment";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";

type FullCalendarGlobal =
    & typeof import("@fullcalendar/core")
    & typeof import("@fullcalendar/interaction")
    & typeof import("@fullcalendar/daygrid")
    & typeof import("@fullcalendar/timegrid")
    & typeof import("@fullcalendar/list")
    & typeof import("@fullcalendar/moment")
    & typeof import("@fullcalendar/moment-timezone")
    & {
        interactionPlugin: typeof import("@fullcalendar/interaction")["default"];
        dayGridPlugin: typeof import("@fullcalendar/daygrid")["default"];
        timeGridPlugin: typeof import("@fullcalendar/timegrid")["default"];
        listPlugin: typeof import("@fullcalendar/list")["default"];
        momentPlugin: typeof import("@fullcalendar/moment")["default"];
        momentTimezonePlugin: typeof import("@fullcalendar/moment-timezone")["default"];
        globalLocales: typeof import("@fullcalendar/core/locales-all.js")["default"];
    };

const FullCalendarGlobal: FullCalendarGlobal = {
    ...FullCalendarCore,
    ...FullCalendarInteraction,
    ...FullCalendarDayGrid,
    ...FullCalendarTimeGrid,
    ...FullCalendarList,
    ...FullCalendarMoment,
    ...FullCalendarMomentTimeZone,
    ...interactionPlugin,
    interactionPlugin: interactionPlugin.default,
    dayGridPlugin: dayGridPlugin.default,
    timeGridPlugin: timeGridPlugin.default,
    listPlugin: listPlugin.default,
    momentPlugin: momentPlugin.default,
    momentTimezonePlugin: momentTimezonePlugin.default,
    globalLocales: FullCalendarCoreLocalesAll.default,
};

declare global {
    export let FullCalendar: FullCalendarGlobal;
    namespace PrimeType {
        export interface WindowExtensions {
            FullCalendar: typeof FullCalendarGlobal;
        }
    }
}

window.FullCalendar ??= FullCalendarGlobal;
