import { Schedule } from "./src/Schedule.js"

declare global {
    namespace PrimeType {
        export interface WidgetRegistry {
            Schedule: typeof Schedule;
        }
    }
    namespace PrimeType.widget {
        export type ScheduleCfg = import("./src/Schedule.js").ScheduleCfg;
    }
}

// @ts-expect-errors
(window.PrimeFaces ??= {}).widget ??= {};
PrimeFaces.widget.Schedule = Schedule;