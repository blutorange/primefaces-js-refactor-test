/**
 * The handler for AJAX requests.
 */
export class Request {
    /**
     * Creates a new request singleton.
     */
    constructor() {
        /** The base URL */
        this.url = "";
    }
    /**
     * @param {string} cfg 
     * @param {unknown} ext 
     * @returns {boolean}
     */
    handle(cfg, ext) {
        return true;
    }
}
