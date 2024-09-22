import { ajax } from "./ajax/index.js";
import { base } from "./base/index.js";
import { widget } from "./widget/index.js";

export const PrimeFaces = {
    ...base,
    ajax,
    widget,
};