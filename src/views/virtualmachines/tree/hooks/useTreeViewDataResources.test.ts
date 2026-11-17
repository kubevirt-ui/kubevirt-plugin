import { useCanListNamespaces } from '@kubevirt-utils/hooks/useCanListNamespaces';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useNamespacesWithListAccess from '@kubevirt-utils/hooks/useNamespacesWithListAccess';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { renderHook } from '@testing-library/react';

import { useTreeViewDataResources } from './useTreeViewDataResources';

jest.mock('@kubevirt-utils/hooks/useCanListNamespaces', () => ({
  useCanListNamespaces: jest.fn(),
}));
jest.mock('@stolostron/multicluster-sdk', () => ({
  useFleetAccessReview: jest.fn(),
  useFleetClusterNames: () => [[], true, undefined],
}));
jest.mock('@kubevirt-utils/hooks/useNamespacesWithListAccess', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@kubevirt-utils/hooks/useProjects', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@kubevirt-utils/hooks/useFeatures/useFeatures', () => ({
  useFeatures: () => ({ featureEnabled: false }),
}));
jest.mock('@multicluster/hooks/useMulticlusterNamespaces', () => ({
  __esModule: true,
  default: () => ({ error: undefined, loaded: true, namespacesByCluster: {} }),
}));
jest.mock('@multicluster/useIsACMPage', () => ({ __esModule: true, default: () => false }));
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useK8sModel: () => [{ plural: 'virtualmachines' }, false],
  useK8sWatchResources: jest.fn(),
}));
jest.mock('@virtualmachines/utils', () => ({
  getLatestMigrationForEachVM: () => ({}),
  OBJECTS_FETCHING_LIMIT: 10000,
}));

const ALL_PROJECTS = ['default', 'openshift-cnv', 'webapp-vms'];
const forbidden = Object.assign(new Error('forbidden'), { code: 403 });
const vm = { metadata: { name: 'vm-1', namespace: 'webapp-vms' } };

const mockCanListNamespaces = useCanListNamespaces as jest.Mock;
const mockCanListClusterWide = useFleetAccessReview as jest.Mock;
const mockNamespacesWithAccess = useNamespacesWithListAccess as jest.Mock;
const mockWatchResource = useKubevirtWatchResource as jest.Mock;
const mockUseProjects = useProjects as jest.Mock;
const mockWatchResources = useK8sWatchResources as jest.Mock;

const vmWatchResourcesCalls = () =>
  mockWatchResources.mock.calls.filter(([map]) =>
    Object.values(map).some(
      (resource: { groupVersionKind: { kind: string } }) =>
        resource.groupVersionKind.kind === 'VirtualMachine',
    ),
  );

describe('useTreeViewDataResources RBAC strategy (CNV-101272)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockUseProjects.mockReturnValue([ALL_PROJECTS, true, undefined]);
    mockNamespacesWithAccess.mockReturnValue([[], true]);
    mockWatchResource.mockReturnValue([[], true, undefined, jest.fn()]);
    mockWatchResources.mockReturnValue({});
  });

  it('mixed RBAC: does not watch VMs cluster-wide; tree lists only VM-accessible projects', () => {
    mockCanListNamespaces.mockReturnValue(true);
    mockCanListClusterWide.mockReturnValue([false, false]);
    mockNamespacesWithAccess.mockReturnValue([['webapp-vms'], true]);
    mockWatchResources.mockImplementation((map) =>
      Object.keys(map).length
        ? { 'webapp-vms': { data: [vm], loaded: true, loadError: undefined } }
        : {},
    );

    const { result } = renderHook(() => useTreeViewDataResources());

    // both the VM and VMIM cluster-wide watches are disabled
    for (const [config] of mockWatchResource.mock.calls.slice(-2)) expect(config).toBeNull();
    expect(Object.keys(vmWatchResourcesCalls().at(-1)[0])).toEqual(['webapp-vms']);
    expect(result.current.projectNames).toEqual(['webapp-vms']);
    expect(result.current.loaded).toBe(true);
    expect(result.current.loadError).toBeUndefined();
    expect(result.current.vms).toEqual([vm]);
  });

  it('per-namespace mode: a 403 in one namespace is soft and does not hide the tree', () => {
    mockCanListNamespaces.mockReturnValue(false);
    mockCanListClusterWide.mockReturnValue([false, false]);
    mockUseProjects.mockReturnValue([['other', 'webapp-vms'], true, undefined]);
    mockWatchResources.mockImplementation((map) =>
      Object.keys(map).length
        ? {
            other: { data: [], loaded: false, loadError: forbidden },
            'webapp-vms': { data: [vm], loaded: true, loadError: undefined },
          }
        : {},
    );

    const { result } = renderHook(() => useTreeViewDataResources());

    expect(result.current.loadError).toBeUndefined();
    expect(result.current.loaded).toBe(true);
    expect(result.current.vms).toEqual([vm]);
  });

  it('is not loaded (and starts no VM watch) while the VM access review is pending', () => {
    mockCanListNamespaces.mockReturnValue(true);
    mockCanListClusterWide.mockReturnValue([false, true]);

    const { result } = renderHook(() => useTreeViewDataResources());

    expect(mockWatchResource.mock.calls.at(-2)[0]).toBeNull();
    expect(vmWatchResourcesCalls()).toHaveLength(0);
    expect(result.current.loaded).toBe(false);
  });

  it('cluster-wide VM list allowed: keeps a single cluster-wide watch', () => {
    mockCanListNamespaces.mockReturnValue(true);
    mockCanListClusterWide.mockReturnValue([true, false]);
    mockWatchResource.mockReturnValue([[vm], true, undefined, jest.fn()]);

    const { result } = renderHook(() => useTreeViewDataResources());

    expect(mockWatchResource.mock.calls.at(-2)[0]).toEqual(
      expect.objectContaining({
        groupVersionKind: expect.objectContaining({ kind: 'VirtualMachine' }),
      }),
    );
    expect(vmWatchResourcesCalls()).toHaveLength(0);
    expect(result.current.loaded).toBe(true);
  });
});
