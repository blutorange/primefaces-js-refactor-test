/**
 * The handler for AJAX responses.
 */
export class Response {
    /**
     * Creates a new response singleton.
     */
    constructor() {
        this.url = "";
    }
    /**
     * @param {string} xml
     * @param {string} status
     * @param {string} xhr
     * @param {() => void} updateHandler
     * @returns {boolean}
     */
    handle(xml, status, xhr, updateHandler) {
        return true;
    }
}