import { useCanListNamespaces } from '@kubevirt-utils/hooks/useCanListNamespaces';
import useCanListResourceClusterWide from '@kubevirt-utils/hooks/useCanListResourceClusterWide';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useNamespacesWithListAccess from '@kubevirt-utils/hooks/useNamespacesWithListAccess';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useK8sModel, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { renderHook } from '@testing-library/react';

import { useAccessibleResources } from './useAccessibleResources';

jest.mock('@kubevirt-utils/hooks/useCanListNamespaces', () => ({
  useCanListNamespaces: jest.fn(),
}));
jest.mock('@kubevirt-utils/hooks/useCanListResourceClusterWide', () => ({
  __esModule: true,
  default: jest.fn(),
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
jest.mock('@multicluster/hooks/useClusterParam', () => ({
  __esModule: true,
  default: () => undefined,
}));
jest.mock('@multicluster/useIsACMPage', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@virtualmachines/search/utils', () => ({ getSearchQueries: () => undefined }));
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useK8sModel: jest.fn(),
  useK8sWatchResources: jest.fn(),
}));

const VM_GVK = { group: 'kubevirt.io', kind: 'VirtualMachine', version: 'v1' };
const VM_MODEL = { apiGroup: 'kubevirt.io', kind: 'VirtualMachine', plural: 'virtualmachines' };
const ALL_PROJECTS = ['default', 'openshift-cnv', 'webapp-vms'];
const forbidden = Object.assign(new Error('forbidden'), { code: 403 });
const vm = { metadata: { name: 'vm-1', namespace: 'webapp-vms' } };

const mockCanListNamespaces = useCanListNamespaces as jest.Mock;
const mockCanListClusterWide = useCanListResourceClusterWide as jest.Mock;
const mockNamespacesWithAccess = useNamespacesWithListAccess as jest.Mock;
const mockWatchResource = useKubevirtWatchResource as jest.Mock;
const mockUseProjects = useProjects as jest.Mock;
const mockIsACMPage = useIsACMPage as jest.Mock;
const mockUseK8sModel = useK8sModel as jest.Mock;
const mockWatchResources = useK8sWatchResources as jest.Mock;

const render = () =>
  renderHook(() => useAccessibleResources({ groupVersionKind: VM_GVK, isWatchEnabled: true }));

describe('useAccessibleResources RBAC strategy (CNV-101272)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockIsACMPage.mockReturnValue(false);
    mockUseK8sModel.mockReturnValue([VM_MODEL, false]);
    mockUseProjects.mockReturnValue([ALL_PROJECTS, true, undefined]);
    mockNamespacesWithAccess.mockReturnValue([[], true]);
    mockWatchResource.mockReturnValue([[], true, undefined]);
    mockWatchResources.mockReturnValue({});
  });

  it('cluster admin: watches VMs cluster-wide', () => {
    mockCanListNamespaces.mockReturnValue(true);
    mockCanListClusterWide.mockReturnValue([true, false]);

    render();

    expect(mockWatchResource.mock.calls.at(-1)[0]).toEqual(
      expect.objectContaining({ groupVersionKind: VM_GVK, isList: true }),
    );
    expect(mockWatchResources.mock.calls.at(-1)[0]).toEqual({});
  });

  it('mixed RBAC (namespaces listable, VMs only in webapp-vms): no cluster-wide VM watch, only webapp-vms', () => {
    mockCanListNamespaces.mockReturnValue(true);
    mockCanListClusterWide.mockReturnValue([false, false]);
    mockNamespacesWithAccess.mockReturnValue([['webapp-vms'], true]);
    mockWatchResources.mockReturnValue({
      'webapp-vms': { data: [vm], loaded: true, loadError: undefined },
    });

    const { result } = render();

    expect(mockWatchResource.mock.calls.at(-1)[0]).toBeNull();
    expect(Object.keys(mockWatchResources.mock.calls.at(-1)[0])).toEqual(['webapp-vms']);
    expect(mockNamespacesWithAccess.mock.calls.at(-1)).toEqual([
      { group: 'kubevirt.io', resource: 'virtualmachines' },
      ALL_PROJECTS,
      true,
    ]);
    expect(result.current).toEqual({ loaded: true, loadError: undefined, resources: [vm] });
  });

  it('mixed RBAC: never reports a cluster-wide 403 as the list error', () => {
    mockCanListNamespaces.mockReturnValue(true);
    mockCanListClusterWide.mockReturnValue([false, false]);
    mockNamespacesWithAccess.mockReturnValue([['webapp-vms'], true]);
    mockWatchResource.mockReturnValue([[], false, forbidden]);
    mockWatchResources.mockReturnValue({
      'webapp-vms': { data: [vm], loaded: true, loadError: undefined },
    });

    const { result } = render();

    expect(result.current.loadError).toBeUndefined();
    expect(result.current.resources).toEqual([vm]);
  });

  it('mixed RBAC with no VM access anywhere resolves loaded with no resources (no endless spinner)', () => {
    mockCanListNamespaces.mockReturnValue(true);
    mockCanListClusterWide.mockReturnValue([false, false]);
    mockNamespacesWithAccess.mockReturnValue([[], true]);
    mockWatchResources.mockReturnValue({});

    const { result } = render();

    expect(result.current).toEqual({ loaded: true, loadError: undefined, resources: [] });
  });

  it('namespace-only user (CAN_LIST_NS false): unchanged per-project watches without extra reviews', () => {
    mockCanListNamespaces.mockReturnValue(false);
    mockCanListClusterWide.mockReturnValue([false, false]);
    mockUseProjects.mockReturnValue([['webapp-vms'], true, undefined]);
    mockWatchResources.mockReturnValue({
      'webapp-vms': { data: [vm], loaded: true, loadError: undefined },
    });

    const { result } = render();

    expect(mockNamespacesWithAccess.mock.calls.at(-1)[2]).toBe(false);
    expect(Object.keys(mockWatchResources.mock.calls.at(-1)[0])).toEqual(['webapp-vms']);
    expect(result.current.loaded).toBe(true);
  });

  it('is not loaded and starts no watch while the cluster-wide access review is pending', () => {
    mockCanListNamespaces.mockReturnValue(true);
    mockCanListClusterWide.mockReturnValue([false, true]);

    const { result } = render();

    expect(mockWatchResource.mock.calls.at(-1)[0]).toBeNull();
    expect(mockWatchResources.mock.calls.at(-1)[0]).toEqual({});
    expect(result.current.loaded).toBe(false);
  });

  it('is not loaded while allowed namespaces are still being reviewed', () => {
    mockCanListNamespaces.mockReturnValue(true);
    mockCanListClusterWide.mockReturnValue([false, false]);
    mockNamespacesWithAccess.mockReturnValue([[], false]);

    const { result } = render();

    expect(mockWatchResources.mock.calls.at(-1)[0]).toEqual({});
    expect(result.current.loaded).toBe(false);
  });

  it('ACM page: skips local access review and keeps fleet-wide watch', () => {
    mockIsACMPage.mockReturnValue(true);
    mockCanListNamespaces.mockReturnValue(false);
    mockCanListClusterWide.mockReturnValue([false, false]);

    render();

    expect(mockCanListClusterWide.mock.calls.at(-1)[0]).toBeNull();
    expect(mockWatchResource.mock.calls.at(-1)[0]).toEqual(
      expect.objectContaining({ groupVersionKind: VM_GVK }),
    );
  });
});
