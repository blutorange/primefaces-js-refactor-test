export class Request {
    constructor() {
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
