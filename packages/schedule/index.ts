// package: schedule.js

import { FullCalendarGlobal } from "./src/FullCalendar.js";
import { Schedule as _Schedule, type ScheduleCfg as _ScheduleCfg } from "./src/Schedule.js";

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
