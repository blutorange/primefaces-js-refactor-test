import path from "node:path";
import { fileURLToPath } from "node:url";

const dirName = path.dirname(fileURLToPath(import.meta.url));

export const RootDir = path.normalize(path.resolve(dirName, "..", ".."));
export const PackagesDir = path.resolve(RootDir, "packages");
export const DistDir = path.resolve(RootDir, "dist");
export const DocsDir = path.resolve(RootDir, "docs");

export const TarBall = path.resolve(RootDir, "package.tgz");

export const IsProduction = process.env.NODE_ENV !== "development";

