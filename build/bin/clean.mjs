import { DistDir, TarBall } from "../common/environment.mjs";
import { findFrontendProjects } from "../common/find-frontend-projects.mjs";
import { deleteIfExists } from "../common/file.mjs";

/**
 * Deletes all generated files and directories. Usually clean is done by
 * Maven, but when working on the frontend, it may be helpful to clean
 * via this script.
 */
async function main() {
    const frontendProjects = await findFrontendProjects();
    await Promise.all([
        deleteIfExists(TarBall),
        deleteIfExists(DistDir),
        ...frontendProjects.map(async project => await deleteIfExists(project.dist)),
        ...frontendProjects.map(async project => await deleteIfExists(project.docs)),
    ]);
}

main().catch(e => {
    console.error(e instanceof Error ? e.stack : e);
    process.exit(1);
});
