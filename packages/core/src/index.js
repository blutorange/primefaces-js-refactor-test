import { ajax } from "./ajax/index.js";
import { abortXHRs, getCookie } from "./base/index.js";
import { widget } from "./widget/index.js";

export const PrimeFaces = {
    abortXHRs,
    getCookie,
    ajax,
    widget,
};