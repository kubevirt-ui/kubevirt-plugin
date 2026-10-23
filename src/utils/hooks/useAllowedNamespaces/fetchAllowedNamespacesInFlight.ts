import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

import { type AllowedNamespacesResponse } from './types';
import { buildAllowedNamespacesFetchRequest, getAllowedNamespacesURL } from './utils';

const inFlightRequests = new Map<string, Promise<AllowedNamespacesResponse>>();

export const getAllowedNamespacesRequestKey = (
  accessReview: FleetAccessReviewResourceAttributes,
): string =>
  [
    accessReview.cluster ?? '',
    accessReview.verb ?? '',
    accessReview.group ?? '',
    accessReview.resource ?? '',
    accessReview.subresource ?? '',
  ].join('|');

export const fetchAllowedNamespacesInFlight = (
  accessReview: FleetAccessReviewResourceAttributes,
): Promise<AllowedNamespacesResponse> => {
  const key = getAllowedNamespacesRequestKey(accessReview);
  const pending = inFlightRequests.get(key);
  if (pending) {
    return pending;
  }

  const request = consoleFetch(
    getAllowedNamespacesURL(),
    buildAllowedNamespacesFetchRequest(accessReview),
  )
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `Allowed namespaces request failed with status ${response.status}: ${response.statusText}`,
        );
      }
      return (await response.json()) as AllowedNamespacesResponse;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, request);
  return request;
};
