/**
 * @template {readonly unknown[] | []} T
 * @param {T} promises 
 * @returns {Promise<{ -readonly [P in keyof T]: Awaited<T[P]>; }>}
 */
export async function allSettledTuple(promises) {
    // @ts-expect-error
    return allSettled(promises);
}

/**
 * Waits for all promises to settle and returns an array of their results.
 * When an input promise rejects, the resulting promise resolves with the
 * rejection reason (but only after all other promises have settled).
 * @template T
 * @param {PromiseLike<T>[]} promises 
 * @returns {Promise<T[]>}
 */
export async function allSettled(promises) {
    const results = await Promise.allSettled(promises);
    const errors = results.filter(r => r.status === "rejected").map(r => r.reason);
    if (errors.length > 0) {
        throw new AggregateError(errors, "One or more promises rejected", );
    }
    return results.filter(r => r.status === "fulfilled").map(r => r.value);
}
