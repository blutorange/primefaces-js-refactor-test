import type { PrimeFaces as PF } from "../../core/src/index.js";

declare global {
    const PrimeFaces: typeof PF;
    interface Window {
        PrimeFaces: typeof PF;
    }
}