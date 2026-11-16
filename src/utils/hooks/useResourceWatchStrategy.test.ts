import { useCanListNamespaces } from '@kubevirt-utils/hooks/useCanListNamespaces';
import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { renderHook } from '@testing-library/react';

import useCanListResourceClusterWide from './useCanListResourceClusterWide';
import useNamespacesWithListAccess from './useNamespacesWithListAccess';
import useResourceWatchStrategy from './useResourceWatchStrategy';

jest.mock('@kubevirt-utils/hooks/useCanListNamespaces', () => ({
  useCanListNamespaces: jest.fn(),
}));
jest.mock('./useCanListResourceClusterWide', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('./useNamespacesWithListAccess', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({ useK8sModel: jest.fn() }));

const mockCanListNamespaces = useCanListNamespaces as jest.Mock;
const mockCanListClusterWide = useCanListResourceClusterWide as jest.Mock;
const mockNamespacesWithAccess = useNamespacesWithListAccess as jest.Mock;
const mockUseK8sModel = useK8sModel as jest.Mock;

const VM_GVK = { group: 'kubevirt.io', kind: 'VirtualMachine', version: 'v1' };
const ALL_PROJECTS = ['default', 'openshift-cnv', 'webapp-vms'];

const render = (overrides = {}) =>
  renderHook(() =>
    useResourceWatchStrategy({
      enabled: true,
      groupVersionKind: VM_GVK,
      namespaces: ALL_PROJECTS,
      namespacesLoaded: true,
      ...overrides,
    }),
  ).result.current;

describe('useResourceWatchStrategy (CNV-101272)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockUseK8sModel.mockReturnValue([{ plural: 'virtualmachines' }, false]);
    mockNamespacesWithAccess.mockReturnValue([[], true]);
  });

  it.each`
    case                                       | canListNs | clusterWideAccess | allowed                   | expected
    ${'cluster admin'}                         | ${true}   | ${[true, false]}  | ${[[], true]}             | ${{ clusterWide: true, namespaces: ALL_PROJECTS, perNamespace: false, resolved: true }}
    ${'mixed RBAC (acm-vm-extended:view CRB)'} | ${true}   | ${[false, false]} | ${[['webapp-vms'], true]} | ${{ clusterWide: false, namespaces: ['webapp-vms'], perNamespace: true, resolved: true }}
    ${'mixed RBAC, narrowing in flight'}       | ${true}   | ${[false, false]} | ${[[], false]}            | ${{ clusterWide: false, namespaces: [], perNamespace: false, resolved: false }}
    ${'namespace-only user'}                   | ${false}  | ${[false, false]} | ${[[], true]}             | ${{ clusterWide: false, namespaces: ALL_PROJECTS, perNamespace: true, resolved: true }}
    ${'access review in flight'}               | ${true}   | ${[false, true]}  | ${[[], true]}             | ${{ clusterWide: false, namespaces: ALL_PROJECTS, perNamespace: false, resolved: false }}
    ${'VM list via cluster role w/o ns list'}  | ${false}  | ${[true, false]}  | ${[[], true]}             | ${{ clusterWide: true, namespaces: ALL_PROJECTS, perNamespace: false, resolved: true }}
  `('$case', ({ allowed, canListNs, clusterWideAccess, expected }) => {
    mockCanListNamespaces.mockReturnValue(canListNs);
    mockCanListClusterWide.mockReturnValue(clusterWideAccess);
    mockNamespacesWithAccess.mockReturnValue(allowed);

    expect(render()).toEqual(expected);
  });

  it('only narrows namespaces for mixed RBAC (no extra reviews for namespace-only users)', () => {
    mockCanListNamespaces.mockReturnValue(false);
    mockCanListClusterWide.mockReturnValue([false, false]);

    render();

    expect(mockNamespacesWithAccess.mock.calls.at(-1)[2]).toBe(false);
  });

  it('does not narrow an explicit namespace list', () => {
    mockCanListNamespaces.mockReturnValue(true);
    mockCanListClusterWide.mockReturnValue([false, false]);

    expect(render({ narrowNamespaces: false })).toEqual({
      clusterWide: false,
      namespaces: ALL_PROJECTS,
      perNamespace: true,
      resolved: true,
    });
  });

  it('is resolved and inert when disabled (ACM pages)', () => {
    mockCanListNamespaces.mockReturnValue(true);
    mockCanListClusterWide.mockReturnValue([false, false]);

    expect(render({ enabled: false })).toEqual({
      clusterWide: false,
      namespaces: ALL_PROJECTS,
      perNamespace: false,
      resolved: true,
    });
    expect(mockCanListClusterWide.mock.calls.at(-1)[0]).toBeNull();
  });

  it('waits for the project list before choosing per-namespace watches', () => {
    mockCanListNamespaces.mockReturnValue(false);
    mockCanListClusterWide.mockReturnValue([false, false]);

    expect(render({ namespacesLoaded: false }).resolved).toBe(false);
  });

  it('waits for model discovery before deciding', () => {
    mockUseK8sModel.mockReturnValue([undefined, true]);
    mockCanListNamespaces.mockReturnValue(true);
    mockCanListClusterWide.mockReturnValue([false, false]);

    expect(render().resolved).toBe(false);
  });
});
