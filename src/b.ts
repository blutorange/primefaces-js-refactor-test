import "./module.js";

declare global { 
  namespace PrimeFaces {
    export interface WindowExtensions{ 
      b: string;
    }
  }
}
