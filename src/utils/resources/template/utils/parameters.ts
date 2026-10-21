const PARAM_REFERENCE_REGEX = /^\$\{(.+)\}$/;

/**
 * Extracts the parameter name from a `${PARAM_NAME}` reference.
 * Returns undefined if the value is not a parameter reference.
 */
export const extractParameterName = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const match = PARAM_REFERENCE_REGEX.exec(value);
  return match?.[1];
};
