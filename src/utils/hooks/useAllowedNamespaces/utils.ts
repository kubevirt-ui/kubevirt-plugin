import { HTTP_METHODS } from '@kubevirt-utils/constants/constants';
import {
  PROXY_ALLOWED_NAMESPACES_PATH,
  PROXY_KUBEVIRT_URL,
} from '@kubevirt-utils/hooks/useKubevirtDataPod/utils/constants';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

import { type AllowedNamespacesResponse } from './types';

export const getAllowedNamespacesURL = (): string =>
  `${PROXY_KUBEVIRT_URL}${PROXY_ALLOWED_NAMESPACES_PATH}`;

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

export const buildAllowedNamespacesFetchRequest = (
  accessReview: FleetAccessReviewResourceAttributes,
): RequestInit => ({
  body: JSON.stringify({
    resourceAttributes: {
      group: accessReview.group,
      resource: accessReview.resource,
      subresource: accessReview.subresource,
      verb: accessReview.verb,
    },
  }),
  headers: {
    'Content-Type': 'application/json',
  },
  method: HTTP_METHODS.POST,
});

export const requestAllowedNamespaces = async (
  accessReview: FleetAccessReviewResourceAttributes,
): Promise<AllowedNamespacesResponse> => {
  const response = await consoleFetch(
    getAllowedNamespacesURL(),
    buildAllowedNamespacesFetchRequest(accessReview),
  );

  if (!response.ok) {
    throw new Error(
      `Allowed namespaces request failed with status ${response.status}: ${response.statusText}`,
    );
  }

  return (await response.json()) as AllowedNamespacesResponse;
};
