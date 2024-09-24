import { Request as AjaxRequest } from "./request.js";
import { Response as AjaxResponse } from "./response.js";

export const ajax = {
    Request: new AjaxRequest(),
    Response: new AjaxResponse(),
};