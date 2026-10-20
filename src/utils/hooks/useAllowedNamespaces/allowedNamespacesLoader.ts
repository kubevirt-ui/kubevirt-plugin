import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

import {
  clearInFlightLoaderRequest,
  getAccessReviewCacheKey,
  getCachedLoaderResult,
  getInFlightKey,
  getInFlightLoaderRequest,
  getProjectsFingerprint,
  nextLoaderRequestGeneration,
  setInFlightLoaderRequest,
  storeLoaderResultIfCurrent,
} from './allowedNamespacesCache';
import { type AllowedNamespacesLoaderResult } from './allowedNamespacesLoaderTypes';
import { fetchAllowedNamespaces } from './fetchAllowedNamespaces';
import { type AllowedNamespacesFailure } from './types';
import { toAllowedNamespacesRequestResourceAttributes } from './utils';

export {
  flushAllowedNamespacesCache,
  getAccessReviewCacheKey,
  peekAllowedNamespacesCache,
} from './allowedNamespacesCache';
export type { AllowedNamespacesLoaderResult } from './allowedNamespacesLoaderTypes';

const buildSpokeClusterResult = (allNamespaceNames: string[]): AllowedNamespacesLoaderResult => ({
  allowedNamespaces: allNamespaceNames,
  error: null,
  failures: [],
  filterByAllowedNamespaces: false,
  loaded: true,
});

const buildFallbackResult = (
  allNamespaceNames: string[],
  error: Error,
): AllowedNamespacesLoaderResult => ({
  allowedNamespaces: allNamespaceNames,
  error,
  failures: [],
  filterByAllowedNamespaces: false,
  loaded: true,
});

const buildApiSuccessResult = (
  allowedNamespaces: string[],
  failures: AllowedNamespacesFailure[],
): AllowedNamespacesLoaderResult => ({
  allowedNamespaces,
  error: null,
  failures,
  filterByAllowedNamespaces: true,
  loaded: true,
});

type LoadAllowedNamespacesParams = {
  accessReview: FleetAccessReviewResourceAttributes;
  allNamespaceNames: string[];
  isSpokeCluster: boolean;
};

const fetchAndCache = async ({
  accessReview,
  allNamespaceNames,
  cacheKey,
  fingerprint,
  generation,
  isSpokeCluster,
}: LoadAllowedNamespacesParams & {
  cacheKey: string;
  fingerprint: string;
  generation: number;
}): Promise<AllowedNamespacesLoaderResult> => {
  if (isSpokeCluster) {
    const result = buildSpokeClusterResult(allNamespaceNames);
    storeLoaderResultIfCurrent(cacheKey, fingerprint, generation, result);
    return result;
  }

  try {
    const response = await fetchAllowedNamespaces({
      resourceAttributes: toAllowedNamespacesRequestResourceAttributes(accessReview),
    });
    const result = buildApiSuccessResult(response.allowedNamespaces ?? [], response.failures ?? []);
    storeLoaderResultIfCurrent(cacheKey, fingerprint, generation, result);
    return result;
  } catch (e) {
    const resolvedError = e instanceof Error ? e : new Error(String(e));
    kubevirtConsole.warn('Failed to resolve allowed namespaces', resolvedError);
    const result = buildFallbackResult(allNamespaceNames, resolvedError);
    storeLoaderResultIfCurrent(cacheKey, fingerprint, generation, result);
    return result;
  }
};

export const loadAllowedNamespaces = ({
  accessReview,
  allNamespaceNames,
  isSpokeCluster,
}: LoadAllowedNamespacesParams): Promise<AllowedNamespacesLoaderResult> => {
  const cacheKey = getAccessReviewCacheKey(accessReview);
  const fingerprint = getProjectsFingerprint(allNamespaceNames);
  const cached = getCachedLoaderResult(cacheKey, fingerprint);
  if (cached) {
    return Promise.resolve(cached);
  }

  const inFlightKey = getInFlightKey(cacheKey, fingerprint);
  const pending = getInFlightLoaderRequest(inFlightKey);
  if (pending) {
    return pending;
  }

  const generation = nextLoaderRequestGeneration(cacheKey);
  const request = fetchAndCache({
    accessReview,
    allNamespaceNames,
    cacheKey,
    fingerprint,
    generation,
    isSpokeCluster,
  }).finally(() => {
    clearInFlightLoaderRequest(inFlightKey);
  });

  setInFlightLoaderRequest(inFlightKey, request);
  return request;
};
