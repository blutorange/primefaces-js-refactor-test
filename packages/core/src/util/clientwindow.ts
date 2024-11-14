export class ClientWindow {
    private static readonly CLIENT_WINDOW_URL_PARAM = "jifwid";
    private static readonly CLIENT_WINDOW_SESSION_STORAGE = "pf.windowId";
    private static readonly TEMP_CLIENT_WINDOW_ID = "temp";
    private static readonly LENGTH_CLIENT_WINDOW_ID = 5;
    private initialized: boolean = false;
    private clientWindowId: string | null = null;
    private initialRedirect: boolean = false;

    init(clientWindowId: string, initialRedirect: boolean): void {
        if (this.initialized) {
            return;
        }
        this.clientWindowId = clientWindowId;
        this.initialRedirect = initialRedirect;
        this.initialized = true;
        console.log(this.clientWindowId);
        console.log(this.initialRedirect);
    }

    cleanupCookies(): void {
        console.log(ClientWindow.LENGTH_CLIENT_WINDOW_ID);
    }

    assertClientWindowId(): void {
        console.log(ClientWindow.CLIENT_WINDOW_URL_PARAM);
        console.log(ClientWindow.TEMP_CLIENT_WINDOW_ID);
        console.log(ClientWindow.CLIENT_WINDOW_SESSION_STORAGE);
    }

    requestNewClientWindowId(): void { }

    getUrlParameter(uri: string, name: string): string | null { return null; }

    replaceUrlParam(uri: string, key: string, value: string): string { return ""; }

    expireCookie(cookieName: string): void { }
}