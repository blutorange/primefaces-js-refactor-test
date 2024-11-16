declare module "fast-sourcemap-concat" {
    export interface SourceMapOptions {
        /**
         * The root directory for resolving source and map files.
         * If no value is given, will default to the current working
         * directory.
         */
        baseDir?: string;
        /**
         * Used to cache encoder results. Passing this in from the outside
         * allows for many instances of the plugin to share one cache.
         */
        cache?: Record<string, unknown>;
        /**
         * The value assigned to the sourcemap's "file" key, as described in the sourcemaps spec.
         * If no value is given, will default to the basename of {@link outputFile}.
         */
        file?: string;
        /**
         * A custom node file system module.
         * @default require("fs-extra")
         */
        fs?: typeof import("fs");
        /**
         * - `line`: `sourceMappingURL` will be written in a single-line comment (//).
         * - `none`: no reference to the source map is included in the source file.
         * - true: `sourceMappingURL` will be written in a block comment (`/ * * /`)
         * @default "line"
         */
        mapCommentType?: "line" | "none" | boolean;
        /**
         * Filename where the concatenated sourcemap will be written.
         * If no value is given, will default to the value of {@link outputFile},
         * but with `.js` replaced by `.map`.
         */
        mapFile?: string;
        /**
         * - `data`: `sourceMappingURL` will contain a data URL instead of {@link mapURL}.
         * - `file`: `sourceMappingURL` will contain {@link mapURL}
         * @default "file"
         */
        mapStyle?: "data" | "file";
        /**
         * The value written to the `sourceMappingURL` comment.
         * If no value is given, will default to the basename of {@link mapFile}.
         */
        mapURL?: string;
        /**
         * Filename where the concatenated source code will be written.
         * If you don't specify this you must specify {@link mapURL} and {@link file}.
         */
        outputFile?: string;
        /**
         * A unique id for one instance of this lib. Ensures unique filenames when
         * reporting stats via CONCAT_STATS env var.
         */
        pluginId?: number;
        /**
         * The value assigned to the sourcemap's "sourceRoot" key, as described in
         * the sourcemaps spec.
         */
        sourceRoot?: string;
    }

    /**
     * https://github.com/ef4/fast-sourcemap-concat
     */
    declare class SourceMap {
        constructor(options?: SourceMapOptions);
        addFile(fileName: string): void;
        addFileSource(filename: string, source: string, inputSrcMap?: string): void;
        addSpace(source: string): void;
        end(cb?: (sourceMap: string) => void): Promise<void>;
        end<T>(cb?: (this: T, sourceMap: string) => void, thisArg: T): void;
    }

    export = SourceMap;
}