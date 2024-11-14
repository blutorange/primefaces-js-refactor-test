// package: schedule.js

import { FullCalendarGlobal } from "./lib/fullcalendar";
import { Schedule as _Schedule, ScheduleCfg as _ScheduleCfg } from "./src/Schedule";

declare global {
    let FullCalendar: FullCalendarGlobal;

    namespace PrimeType {
        export interface WindowExtensions {
            FullCalendar: typeof FullCalendar;
        }
    }

    namespace PrimeType.widget {
        export type ScheduleCfg = _ScheduleCfg;
        export interface WidgetRegistry {
            Schedule: typeof _Schedule;
        }
    }
}

window.FullCalendar ??= FullCalendarGlobal;

// @ts-expect-error
(window.PrimeFaces ??= {}).widget ??= {};
PrimeFaces.widget.Schedule ??= _Schedule;
