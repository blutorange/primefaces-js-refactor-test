/**
 * @module core
 */
import { ajax } from "./ajax/index.js";
import { abortXHRs, getCookie } from "./base/index.js";
import { widget } from "./widget/index.js";

/**
 * This is the main entry point, available via `window.PrimeFaces`.
 * @namespace
 */
export const PrimeFaces = {
    abortXHRs,
    getCookie,
    ajax,
    widget,
};