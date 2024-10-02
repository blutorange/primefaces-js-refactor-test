import { Request as AjaxRequest } from "./request.js";
import { Response as AjaxResponse } from "./response.js";

/**
 * This is the main entry point for AJAX related features, available via `window.PrimeFaces.ajax`.
 * @namespace
 */
export const ajax = {
    /** The request class */
    Request: new AjaxRequest(),
    /** The response class */
    Response: new AjaxResponse(),
};