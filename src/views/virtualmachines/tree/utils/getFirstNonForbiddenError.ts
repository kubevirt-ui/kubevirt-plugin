import { isForbiddenError } from '@kubevirt-utils/errors/errorTypes';

/**
 * Per-namespace watches: a 403 only means "no access in that namespace" (CNV-101272), so it is
 * ignored; any other error (network, 5xx, 404 CRD missing) is still surfaced.
 */
export const getFirstNonForbiddenError = (resources: { loadError?: unknown }[]): unknown =>
  resources
    .map((resource) => resource.loadError)
    .find((error) => error && !isForbiddenError(error));
