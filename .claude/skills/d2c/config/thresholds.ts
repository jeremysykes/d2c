/**
 * Validate phase threshold constants.
 *
 * The structural gate (computed CSS vs manifest tokens) is deterministic —
 * no configurable threshold. Values either match or they don't.
 *
 * The token delta gate uses a hard-zero threshold that cannot be overridden.
 */

/** Token value mismatches allowed. Unit: count. Hard zero — cannot be overridden. */
export const TOKEN_THRESHOLD_DEFAULT = 0;
export const TOKEN_THRESHOLD_UNIT = "count";

/**
 * Token threshold override flag.
 * This is always false. Even if a user passes --diff-threshold-token with a
 * non-zero value, the effective threshold must remain 0.
 * A token mismatch means the component is visually incorrect by definition.
 */
export const TOKEN_THRESHOLD_OVERRIDE = false;
