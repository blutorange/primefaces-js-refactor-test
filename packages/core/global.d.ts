import type { PrimeFaces as PF } from "./dist/index.d.ts";

export type * from "./dist/types.js";

declare global {
    const PrimeFaces: typeof PF;
    interface Window {
        PrimeFaces: typeof PF;
    }
}