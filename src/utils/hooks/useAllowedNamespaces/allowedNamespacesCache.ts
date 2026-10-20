import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

import { type AllowedNamespacesLoaderResult } from './allowedNamespacesLoaderTypes';

type CacheEntry = {
  fingerprint: string;
  result: AllowedNamespacesLoaderResult;
};

const resultCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<AllowedNamespacesLoaderResult>>();
const requestGenerationByCacheKey = new Map<string, number>();

export const getAccessReviewCacheKey = (
  accessReview: FleetAccessReviewResourceAttributes,
): string =>
  [
    accessReview.cluster ?? '',
    accessReview.verb ?? '',
    accessReview.group ?? '',
    accessReview.resource ?? '',
    accessReview.subresource ?? '',
  ].join('|');

export const getProjectsFingerprint = (namespaceNames: string[]): string =>
  namespaceNames.join('\0');

export const getInFlightKey = (cacheKey: string, fingerprint: string): string =>
  `${cacheKey}|${fingerprint}`;

export const peekAllowedNamespacesCache = (
  accessReview: FleetAccessReviewResourceAttributes,
  namespaceNames: string[],
): AllowedNamespacesLoaderResult | undefined => {
  const cacheKey = getAccessReviewCacheKey(accessReview);
  const fingerprint = getProjectsFingerprint(namespaceNames);
  const cached = resultCache.get(cacheKey);
  if (cached?.fingerprint === fingerprint) {
    return cached.result;
  }
  return undefined;
};

export const flushAllowedNamespacesCache = (cluster?: string): void => {
  if (!cluster) {
    resultCache.clear();
    inFlightRequests.clear();
    requestGenerationByCacheKey.clear();
    return;
  }

  const clusterPrefix = `${cluster}|`;
  for (const key of resultCache.keys()) {
    if (key.startsWith(clusterPrefix)) {
      resultCache.delete(key);
      requestGenerationByCacheKey.delete(key);
    }
  }
  for (const key of inFlightRequests.keys()) {
    if (key.startsWith(clusterPrefix)) {
      inFlightRequests.delete(key);
    }
  }
};

export const getCachedLoaderResult = (
  cacheKey: string,
  fingerprint: string,
): AllowedNamespacesLoaderResult | undefined => {
  const cached = resultCache.get(cacheKey);
  if (cached?.fingerprint === fingerprint) {
    return cached.result;
  }
  if (cached && cached.fingerprint !== fingerprint) {
    resultCache.delete(cacheKey);
  }
  return undefined;
};

export const getInFlightLoaderRequest = (
  inFlightKey: string,
): Promise<AllowedNamespacesLoaderResult> | undefined => inFlightRequests.get(inFlightKey);

export const setInFlightLoaderRequest = (
  inFlightKey: string,
  request: Promise<AllowedNamespacesLoaderResult>,
): void => {
  inFlightRequests.set(inFlightKey, request);
};

export const clearInFlightLoaderRequest = (inFlightKey: string): void => {
  inFlightRequests.delete(inFlightKey);
};

export const nextLoaderRequestGeneration = (cacheKey: string): number => {
  const generation = (requestGenerationByCacheKey.get(cacheKey) ?? 0) + 1;
  requestGenerationByCacheKey.set(cacheKey, generation);
  return generation;
};

export const storeLoaderResultIfCurrent = (
  cacheKey: string,
  fingerprint: string,
  generation: number,
  result: AllowedNamespacesLoaderResult,
): void => {
  if (requestGenerationByCacheKey.get(cacheKey) === generation) {
    resultCache.set(cacheKey, { fingerprint, result });
  }
};
