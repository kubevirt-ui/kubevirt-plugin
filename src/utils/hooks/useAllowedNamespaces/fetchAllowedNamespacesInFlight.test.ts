import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

import {
  fetchAllowedNamespacesInFlight,
  getAllowedNamespacesRequestKey,
} from './fetchAllowedNamespacesInFlight';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  consoleFetch: jest.fn(),
}));

const accessReview: FleetAccessReviewResourceAttributes = {
  cluster: 'local-cluster',
  group: 'kubevirt.io',
  resource: 'virtualmachines',
  verb: 'create',
};

describe('fetchAllowedNamespacesInFlight', () => {
  beforeEach(() => {
    jest.mocked(consoleFetch).mockReset();
  });

  it('builds a stable request key from access review attributes', () => {
    expect(getAllowedNamespacesRequestKey(accessReview)).toBe(
      'local-cluster|create|kubevirt.io|virtualmachines|',
    );
  });

  it('deduplicates concurrent requests for the same access review', async () => {
    jest.mocked(consoleFetch).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                json: async () => ({ allowedNamespaces: ['default'] }),
                ok: true,
                status: 200,
                statusText: 'OK',
              } as Response),
            10,
          );
        }),
    );

    const [first, second] = await Promise.all([
      fetchAllowedNamespacesInFlight(accessReview),
      fetchAllowedNamespacesInFlight(accessReview),
    ]);

    expect(consoleFetch).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
    expect(first.allowedNamespaces).toEqual(['default']);
  });
});
