import "./module.js";

declare global {
  namespace PrimeFaces {
    export interface WindowExtensions{
      a: string;
    }
  }
}

