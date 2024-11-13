// package: schedule.js
/// <reference path="./lib/fullcalendar.ts" />
/// <reference path="./src/Schedule.ts" />

namespace PrimeFaces {
    export interface WindowExtensions {
        /**
         * Exposes the [FullCalendar](https://fullcalendar.io/) library
         * to the global window scope.
         * See {@link FullCalendar}.
         */
        FullCalendar: typeof FullCalendar;
    }
}
