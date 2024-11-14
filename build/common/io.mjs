import fs from "node:fs/promises";

/**
 * Gets the stats of a file or directory, if it exists.
 * @param {string} fileOrFolder
 * @returns {Promise<import("node:fs").Stats | undefined>}
 */
async function fileStats(fileOrFolder) {
    try {
        const stats = await fs.stat(fileOrFolder);
        return stats;
    } catch {
        return undefined;
    }
}

/**
 * Checks if the given path is a file and exists.
 * @param {string} fileOrFolder 
 * @returns {Promise<boolean>}
 */
export async function existsAndIsFile(fileOrFolder) {
    return (await fileStats(fileOrFolder))?.isFile() ?? false;
}

/**
 * Checks if the given path exists (neither file nor directory).
 * @param {string} fileOrFolder 
 * @returns {Promise<boolean>}
 */
export async function exists(fileOrFolder) {
    return (await fileStats(fileOrFolder)) !== undefined;
}

/**
 * Checks if the given path is a directory and exists.
 * @param {string} fileOrFolder 
 * @returns {Promise<boolean>}
 */
export async function existsAndIsDirectory(fileOrFolder) {
    return (await fileStats(fileOrFolder))?.isDirectory() ?? false;
}

/**
 * Asserts that the given path is a file and exists.
 * @param {string} fileOrFolder 
 */
export async function assertExistsAndIsFile(fileOrFolder) {
    if (!await existsAndIsFile(fileOrFolder)) {
        throw new Error(`File does not exist: ${fileOrFolder}`);
    }
}

/**
 * Asserts that the given path does not exist (neither file nor directory).
 * @param {string} fileOrFolder 
 * @param {string} [reason]
 */
export async function assertDoesNotExist(fileOrFolder, reason) {
    if (await exists(fileOrFolder)) {
        throw new Error(`File must not exist: ${fileOrFolder}${reason ? ` - ${reason}` : ""}`);
    }
}

/**
 * Check if the given directory exists and create it if it doesn't.
 * Creates all parent directories if they don't exist.
 * @param {string} fileOrFolder Path to the directory.
 */
export async function ensureDirectoryExists(fileOrFolder) {
    await fs.mkdir(fileOrFolder, { recursive: true });
}

/**
 * Deletes the file or directory if it exists. Does nothing
 * if it doesn't exist.
 * @param {string} fileOrFolder Path to the file or directory.
 */
export async function deleteIfExists(fileOrFolder) {
    const stats = await fileStats(fileOrFolder);
    if (stats?.isDirectory()) {
        await fs.rm(fileOrFolder, { recursive: true });
    } else if (stats?.isFile()) {
        await fs.unlink(fileOrFolder);
    }
}
