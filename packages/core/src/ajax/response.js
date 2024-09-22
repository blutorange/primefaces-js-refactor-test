export class Response {
    constructor() {
        this.url = "";
    }
    /**
     * @param {string} xml
     * @param {string} status
     * @param {string} xhr
     * @param {() => {}} updateHandler
     * @returns {boolean}
     */
    handle(xml, status, xhr, updateHandler) {
        return true;
    }
}
