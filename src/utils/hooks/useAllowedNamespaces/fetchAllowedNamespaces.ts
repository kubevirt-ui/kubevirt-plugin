import {
  PROXY_ALLOWED_NAMESPACES_PATH,
  PROXY_KUBEVIRT_URL,
} from '@kubevirt-utils/hooks/useKubevirtDataPod/utils/constants';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

import { type AllowedNamespacesRequest, type AllowedNamespacesResponse } from './types';

export const getAllowedNamespacesURL = (maxConcurrency?: number): string => {
  const base = `${PROXY_KUBEVIRT_URL}${PROXY_ALLOWED_NAMESPACES_PATH}`;
  if (maxConcurrency == null) {
    return base;
  }
  return `${base}?maxConcurrency=${maxConcurrency}`;
};

export const fetchAllowedNamespaces = async (
  request: AllowedNamespacesRequest,
  maxConcurrency?: number,
): Promise<AllowedNamespacesResponse> => {
  const response = await consoleFetch(getAllowedNamespacesURL(maxConcurrency), {
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(
      `Allowed namespaces request failed with status ${response.status}: ${response.statusText}`,
    );
  }

  return (await response.json()) as AllowedNamespacesResponse;
};
