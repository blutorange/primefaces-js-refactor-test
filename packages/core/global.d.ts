import type { PrimeFaces as PF } from "primefaces-core";

declare global {
    const PrimeFaces: typeof PF;
    interface Window {
        PrimeFaces: typeof PF;
    }
}