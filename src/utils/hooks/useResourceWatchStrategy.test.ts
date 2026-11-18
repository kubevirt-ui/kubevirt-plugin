import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { renderHook } from '@testing-library/react';

import useResourceWatchStrategy from './useResourceWatchStrategy';

jest.mock('@stolostron/multicluster-sdk', () => ({ useFleetAccessReview: jest.fn() }));
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({ useK8sModel: jest.fn() }));

const mockCanListClusterWide = useFleetAccessReview as jest.Mock;
const mockUseK8sModel = useK8sModel as jest.Mock;

const VM_GVK = { group: 'kubevirt.io', kind: 'VirtualMachine', version: 'v1' };

const render = (overrides = {}) =>
  renderHook(() =>
    useResourceWatchStrategy({
      enabled: true,
      groupVersionKind: VM_GVK,
      namespacesLoaded: true,
      ...overrides,
    }),
  ).result.current;

describe('useResourceWatchStrategy (CNV-101272)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockUseK8sModel.mockReturnValue([{ plural: 'virtualmachines' }, false]);
  });

  it.each`
    case                                                    | clusterWideAccess | expected
    ${'cluster admin / VM list via cluster role'}           | ${[true, false]}  | ${{ clusterWide: true, perNamespace: false, resolved: true }}
    ${'no cluster-wide VM list (mixed RBAC, ns-only user)'} | ${[false, false]} | ${{ clusterWide: false, perNamespace: true, resolved: true }}
    ${'access review in flight'}                            | ${[false, true]}  | ${{ clusterWide: false, perNamespace: false, resolved: false }}
  `('$case', ({ clusterWideAccess, expected }) => {
    mockCanListClusterWide.mockReturnValue(clusterWideAccess);

    expect(render()).toEqual(expected);
  });

  it('is resolved and inert when disabled (ACM pages)', () => {
    mockCanListClusterWide.mockReturnValue([false, false]);

    expect(render({ enabled: false })).toEqual({
      clusterWide: false,
      perNamespace: false,
      resolved: true,
    });
    expect(mockCanListClusterWide.mock.calls.at(-1)[0]).toEqual(
      expect.objectContaining({ group: '', resource: '' }),
    );
  });

  it('waits for the project list before choosing per-namespace watches', () => {
    mockCanListClusterWide.mockReturnValue([false, false]);

    expect(render({ namespacesLoaded: false }).resolved).toBe(false);
  });

  it('waits for model discovery before deciding', () => {
    mockUseK8sModel.mockReturnValue([undefined, true]);
    mockCanListClusterWide.mockReturnValue([false, false]);

    expect(render().resolved).toBe(false);
  });

  it('reviews list access on the watched resource (local cluster)', () => {
    mockCanListClusterWide.mockReturnValue([true, false]);

    render();

    expect(mockCanListClusterWide).toHaveBeenCalledWith({
      cluster: undefined,
      group: 'kubevirt.io',
      namespace: undefined,
      resource: 'virtualmachines',
      verb: 'list',
    });
  });

  it('reviews list access on the requested managed cluster', () => {
    mockCanListClusterWide.mockReturnValue([true, false]);

    render({ cluster: 'spoke-1' });

    expect(mockCanListClusterWide).toHaveBeenCalledWith(
      expect.objectContaining({ cluster: 'spoke-1', resource: 'virtualmachines', verb: 'list' }),
    );
  });

  it('skips the resource review while the model is unresolved', () => {
    mockUseK8sModel.mockReturnValue([undefined, true]);
    mockCanListClusterWide.mockReturnValue([true, false]);

    const { clusterWide, resolved } = render();

    expect(mockCanListClusterWide).toHaveBeenLastCalledWith(
      expect.objectContaining({ group: '', resource: '' }),
    );
    expect(clusterWide).toBe(false);
    expect(resolved).toBe(false);
  });
});
