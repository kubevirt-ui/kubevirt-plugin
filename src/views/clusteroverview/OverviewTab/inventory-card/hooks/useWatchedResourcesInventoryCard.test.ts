/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import useMultipleAccessReviews from '@kubevirt-utils/hooks/useMultipleAccessReviews';
import { AccessReviewResourceAttributes } from '@openshift-console/dynamic-plugin-sdk';
import { renderHook } from '@testing-library/react-hooks';

import { useWatchedResourcesHook } from './useWatchedResourcesInventoryCard';

const projectNames = ['ns-allowed', 'ns-forbidden', 'ns-templates-only'];

// namespaces where each resource's `list` verb should be considered allowed
const allowedNamespacesByResource: Record<string, string[]> = {
  'network-attachment-definitions': ['ns-allowed'],
  templates: ['ns-allowed', 'ns-templates-only'],
  virtualmachines: ['ns-allowed'],
};

jest.mock('./useProjectNames', () => ({
  __esModule: true,
  useProjectNames: jest.fn(() => projectNames),
}));

const defaultAccessReviewsImplementation = (attributes: AccessReviewResourceAttributes[]) => [
  attributes.map((resourceAttributes) => ({
    allowed: allowedNamespacesByResource[resourceAttributes.resource]?.includes(
      resourceAttributes.namespace,
    ),
    resourceAttributes,
  })),
  false,
];

jest.mock('@kubevirt-utils/hooks/useMultipleAccessReviews', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('useWatchedResourcesHook', () => {
  beforeEach(() => {
    (useMultipleAccessReviews as jest.Mock).mockReset();
    (useMultipleAccessReviews as jest.Mock).mockImplementation(defaultAccessReviewsImplementation);
  });

  describe('for non-admin users', () => {
    it('only watches namespaces where the user can list the resource', () => {
      const { result } = renderHook(() => useWatchedResourcesHook(false)());

      expect(Object.keys(result.current)).toEqual(
        expect.arrayContaining([
          'ns-allowed/virtualmachines',
          'ns-allowed/templates',
          'ns-templates-only/templates',
          'ns-allowed/network-attachment-definitions',
        ]),
      );
    });

    it('never opens a watch for a namespace the user is forbidden to list', () => {
      const { result } = renderHook(() => useWatchedResourcesHook(false)());

      const forbiddenKeys = [
        'ns-forbidden/virtualmachines',
        'ns-forbidden/templates',
        'ns-forbidden/network-attachment-definitions',
        'ns-templates-only/virtualmachines',
        'ns-templates-only/network-attachment-definitions',
      ];

      forbiddenKeys.forEach((key) => {
        expect(Object.keys(result.current)).not.toContain(key);
      });
    });

    it('still includes the cluster-scoped nodes watch', () => {
      const { result } = renderHook(() => useWatchedResourcesHook(false)());

      expect(result.current.nodes).toEqual(
        expect.objectContaining({ isList: true, namespaced: false }),
      );
    });

    it('opens no per-namespace watches while access reviews are still loading', () => {
      (useMultipleAccessReviews as jest.Mock).mockImplementation(() => [[], true]);

      const { result } = renderHook(() => useWatchedResourcesHook(false)());

      expect(Object.keys(result.current)).toEqual(['nodes']);
    });
  });

  describe('for admin users', () => {
    it('uses cluster-scoped watches instead of per-namespace ones', () => {
      const { result } = renderHook(() => useWatchedResourcesHook(true)());
      const adminResources = result.current as unknown as Record<string, { namespaced?: boolean }>;

      expect(Object.keys(adminResources)).toEqual(
        expect.arrayContaining(['nads', 'nodes', 'vms', 'vmTemplates']),
      );
      expect(adminResources.vms).toEqual(expect.objectContaining({ namespaced: true }));
    });
  });
});
