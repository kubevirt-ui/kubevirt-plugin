import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

import {
  flushAllowedNamespacesCache,
  getAccessReviewCacheKey,
  peekAllowedNamespacesCache,
} from './allowedNamespacesCache';
import { loadAllowedNamespaces } from './allowedNamespacesLoader';
import { fetchAllowedNamespaces } from './fetchAllowedNamespaces';

jest.mock('./fetchAllowedNamespaces', () => ({
  fetchAllowedNamespaces: jest.fn(),
}));

const accessReview: FleetAccessReviewResourceAttributes = {
  cluster: 'local-cluster',
  group: 'kubevirt.io',
  resource: 'virtualmachines',
  verb: 'create',
};

const namespacesA = ['default', 'openshift-cnv'];
const namespacesB = ['default', 'openshift-cnv', 'new-project'];

describe('allowedNamespacesLoader', () => {
  beforeEach(() => {
    flushAllowedNamespacesCache();
    jest.mocked(fetchAllowedNamespaces).mockReset();
    jest.useRealTimers();
  });

  it('deduplicates concurrent requests for the same access review and project list', async () => {
    jest.mocked(fetchAllowedNamespaces).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                allowedNamespaces: ['default'],
              }),
            10,
          );
        }),
    );

    const [first, second] = await Promise.all([
      loadAllowedNamespaces({
        accessReview,
        allNamespaceNames: namespacesA,
        isSpokeCluster: false,
      }),
      loadAllowedNamespaces({
        accessReview,
        allNamespaceNames: namespacesA,
        isSpokeCluster: false,
      }),
    ]);

    expect(fetchAllowedNamespaces).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
    expect(first.filterByAllowedNamespaces).toBe(true);
    expect(first.allowedNamespaces).toEqual(['default']);
  });

  it('serves cached results without refetching', async () => {
    jest.mocked(fetchAllowedNamespaces).mockResolvedValue({
      allowedNamespaces: ['default'],
    });

    await loadAllowedNamespaces({
      accessReview,
      allNamespaceNames: namespacesA,
      isSpokeCluster: false,
    });

    await loadAllowedNamespaces({
      accessReview,
      allNamespaceNames: namespacesA,
      isSpokeCluster: false,
    });

    expect(fetchAllowedNamespaces).toHaveBeenCalledTimes(1);
    expect(peekAllowedNamespacesCache(accessReview, namespacesA)?.allowedNamespaces).toEqual([
      'default',
    ]);
  });

  it('refetches when the project list changes', async () => {
    jest
      .mocked(fetchAllowedNamespaces)
      .mockResolvedValueOnce({ allowedNamespaces: ['default'] })
      .mockResolvedValueOnce({ allowedNamespaces: ['default', 'new-project'] });

    await loadAllowedNamespaces({
      accessReview,
      allNamespaceNames: namespacesA,
      isSpokeCluster: false,
    });

    const afterProjectAdded = await loadAllowedNamespaces({
      accessReview,
      allNamespaceNames: namespacesB,
      isSpokeCluster: false,
    });

    expect(fetchAllowedNamespaces).toHaveBeenCalledTimes(2);
    expect(peekAllowedNamespacesCache(accessReview, namespacesA)).toBeUndefined();
    expect(afterProjectAdded.allowedNamespaces).toEqual(['default', 'new-project']);
  });

  it('builds stable cache keys from fleet access review attributes', () => {
    expect(getAccessReviewCacheKey(accessReview)).toBe(
      'local-cluster|create|kubevirt.io|virtualmachines|',
    );
  });
});
