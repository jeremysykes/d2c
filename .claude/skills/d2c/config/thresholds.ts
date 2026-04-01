/**
 * Diff threshold constants for the validate phase.
 *
 * Three independent thresholds gate lifecycle advancement.
 * Each catches a different failure mode — see playwright.md for rationale.
 */

/** Max percentage of changed pixels. Unit: % */
export const PIXEL_THRESHOLD_DEFAULT = 0.1;
export const PIXEL_THRESHOLD_UNIT = "%";

/** Max contiguous changed region area. Unit: px² */
export const REGION_THRESHOLD_DEFAULT = 15;
export const REGION_THRESHOLD_UNIT = "px²";

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
