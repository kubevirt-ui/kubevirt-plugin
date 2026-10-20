import {
  PROXY_ALLOWED_NAMESPACES_PATH,
  PROXY_KUBEVIRT_URL,
} from '@kubevirt-utils/hooks/useKubevirtDataPod/utils/constants';

import { getAllowedNamespacesURL } from './fetchAllowedNamespaces';

describe('getAllowedNamespacesURL', () => {
  it('returns the proxy allowed namespaces endpoint', () => {
    expect(getAllowedNamespacesURL()).toBe(`${PROXY_KUBEVIRT_URL}${PROXY_ALLOWED_NAMESPACES_PATH}`);
  });

  it('appends maxConcurrency when provided', () => {
    expect(getAllowedNamespacesURL(50)).toBe(
      `${PROXY_KUBEVIRT_URL}${PROXY_ALLOWED_NAMESPACES_PATH}?maxConcurrency=50`,
    );
  });
});
