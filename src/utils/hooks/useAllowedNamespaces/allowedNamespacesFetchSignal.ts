import { signal } from '@preact/signals-react';
import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

import { type AllowedNamespacesFetchEntry, type UseFetchAllowedNamespacesResult } from './types';
import { getAllowedNamespacesRequestKey, requestAllowedNamespaces } from './utils';

export const allowedNamespacesFetchNotLoaded: UseFetchAllowedNamespacesResult = {
  data: undefined,
  error: null,
  loaded: false,
};

type FetchCacheEntry = AllowedNamespacesFetchEntry & { loading: boolean };

export const allowedNamespacesFetchCache = signal<ReadonlyMap<string, FetchCacheEntry>>(new Map());

const consumerCountByKey = new Map<string, number>();

const toFetchError = (reason: unknown): Error =>
  reason instanceof Error ? reason : new Error(String(reason));

export const getAllowedNamespacesFetchEntry = (
  accessReview: FleetAccessReviewResourceAttributes,
): FetchCacheEntry | undefined =>
  allowedNamespacesFetchCache.value.get(getAllowedNamespacesRequestKey(accessReview));

const setAllowedNamespacesFetchEntry = (
  accessReview: FleetAccessReviewResourceAttributes,
  entry: FetchCacheEntry,
): void => {
  allowedNamespacesFetchCache.value = new Map(allowedNamespacesFetchCache.value).set(
    getAllowedNamespacesRequestKey(accessReview),
    entry,
  );
};

const removeAllowedNamespacesFetchEntry = (
  accessReview: FleetAccessReviewResourceAttributes,
): void => {
  const key = getAllowedNamespacesRequestKey(accessReview);
  const next = new Map(allowedNamespacesFetchCache.value);
  next.delete(key);
  allowedNamespacesFetchCache.value = next;
};

export const loadAllowedNamespaces = (accessReview: FleetAccessReviewResourceAttributes): void => {
  if (getAllowedNamespacesFetchEntry(accessReview)) {
    return;
  }

  setAllowedNamespacesFetchEntry(accessReview, {
    data: undefined,
    error: null,
    loading: true,
  });

  void requestAllowedNamespaces(accessReview)
    .then((data) => {
      setAllowedNamespacesFetchEntry(accessReview, { data, error: null, loading: false });
    })
    .catch((reason) => {
      setAllowedNamespacesFetchEntry(accessReview, {
        data: undefined,
        error: toFetchError(reason),
        loading: false,
      });
    });
};

export const retainAllowedNamespacesFetch = (
  accessReview: FleetAccessReviewResourceAttributes,
): void => {
  const key = getAllowedNamespacesRequestKey(accessReview);
  consumerCountByKey.set(key, (consumerCountByKey.get(key) ?? 0) + 1);
  loadAllowedNamespaces(accessReview);
};

export const releaseAllowedNamespacesFetch = (
  accessReview: FleetAccessReviewResourceAttributes,
): void => {
  const key = getAllowedNamespacesRequestKey(accessReview);
  const nextCount = (consumerCountByKey.get(key) ?? 0) - 1;

  if (nextCount <= 0) {
    consumerCountByKey.delete(key);
    removeAllowedNamespacesFetchEntry(accessReview);
    return;
  }

  consumerCountByKey.set(key, nextCount);
};

export const getAllowedNamespacesFetchResult = (
  accessReview: FleetAccessReviewResourceAttributes | null,
): UseFetchAllowedNamespacesResult => {
  if (!accessReview) {
    return allowedNamespacesFetchNotLoaded;
  }

  const entry = getAllowedNamespacesFetchEntry(accessReview);
  if (!entry || entry.loading) {
    return allowedNamespacesFetchNotLoaded;
  }

  return { data: entry.data, error: entry.error, loaded: true };
};

export const resetAllowedNamespacesFetchCache = (): void => {
  consumerCountByKey.clear();
  allowedNamespacesFetchCache.value = new Map();
};
