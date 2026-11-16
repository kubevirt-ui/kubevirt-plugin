import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { renderHook } from '@testing-library/react';

import useCanListResourceClusterWide from './useCanListResourceClusterWide';

jest.mock('@stolostron/multicluster-sdk', () => ({
  useFleetAccessReview: jest.fn(),
}));

const mockedUseFleetAccessReview = useFleetAccessReview as jest.Mock;

const VM_ACCESS = { group: 'kubevirt.io', resource: 'virtualmachines' };

describe('useCanListResourceClusterWide', () => {
  beforeEach(() => jest.resetAllMocks());

  it('reviews list on the resource itself, cluster-wide (no namespace)', () => {
    mockedUseFleetAccessReview.mockReturnValue([true, false]);

    const { result } = renderHook(() => useCanListResourceClusterWide(VM_ACCESS));

    expect(result.current).toEqual([true, false]);
    expect(mockedUseFleetAccessReview).toHaveBeenCalledWith({
      cluster: undefined,
      group: 'kubevirt.io',
      namespace: undefined,
      resource: 'virtualmachines',
      verb: 'list',
    });
  });

  it('reports false when only namespaces are listable (acm-vm-extended:view, CNV-101272)', () => {
    mockedUseFleetAccessReview.mockReturnValue([false, false]);

    const { result } = renderHook(() => useCanListResourceClusterWide(VM_ACCESS));

    expect(result.current).toEqual([false, false]);
  });

  it('reports loading while the access review is in flight', () => {
    mockedUseFleetAccessReview.mockReturnValue([false, true]);

    const { result } = renderHook(() => useCanListResourceClusterWide(VM_ACCESS));

    expect(result.current).toEqual([false, true]);
  });

  it('is skipped (not allowed, not loading) when attributes are null or the resource is empty', () => {
    mockedUseFleetAccessReview.mockReturnValue([true, true]);

    expect(renderHook(() => useCanListResourceClusterWide(null)).result.current).toEqual([
      false,
      false,
    ]);
    expect(
      renderHook(() => useCanListResourceClusterWide({ group: 'kubevirt.io', resource: '' })).result
        .current,
    ).toEqual([false, false]);
  });

  it('forwards cluster and namespace scope', () => {
    mockedUseFleetAccessReview.mockReturnValue([true, false]);

    renderHook(() =>
      useCanListResourceClusterWide(VM_ACCESS, { cluster: 'spoke-1', namespace: 'webapp-vms' }),
    );

    expect(mockedUseFleetAccessReview).toHaveBeenCalledWith(
      expect.objectContaining({ cluster: 'spoke-1', namespace: 'webapp-vms' }),
    );
  });
});
