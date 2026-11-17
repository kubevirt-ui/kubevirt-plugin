import { useFlag } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { renderHook } from '@testing-library/react';

import { useCanListNamespaces } from './useCanListNamespaces';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({ useFlag: jest.fn() }));
jest.mock('@stolostron/multicluster-sdk', () => ({ useFleetAccessReview: jest.fn() }));
jest.mock('@kubevirt-ui-ext/kubevirt-api/console', () => ({
  NamespaceModel: { plural: 'namespaces' },
}));

const mockUseFlag = useFlag as jest.Mock;
const mockUseFleetAccessReview = useFleetAccessReview as jest.Mock;

describe('useCanListNamespaces', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockUseFleetAccessReview.mockReturnValue([false, false]);
  });

  it.each`
    flag     | expected
    ${true}  | ${true}
    ${false} | ${false}
  `('without a cluster returns CAN_LIST_NS ($flag)', ({ expected, flag }) => {
    mockUseFlag.mockReturnValue(flag);

    const { result } = renderHook(() => useCanListNamespaces());

    expect(result.current).toBe(expected);
    expect(mockUseFlag).toHaveBeenCalledWith('CAN_LIST_NS');
    expect(mockUseFleetAccessReview).toHaveBeenCalledWith(
      expect.objectContaining({ resource: '' }),
    );
  });

  it.each([undefined, ''])('skips the fleet access review when cluster is %p', (cluster) => {
    mockUseFlag.mockReturnValue(true);
    mockUseFleetAccessReview.mockReturnValue([false, false]);

    const { result } = renderHook(() => useCanListNamespaces(cluster));

    expect(result.current).toBe(true);
    expect(mockUseFleetAccessReview).toHaveBeenCalledWith(
      expect.objectContaining({ resource: '' }),
    );
  });

  it('with a cluster reviews `list namespaces` on that cluster and ignores CAN_LIST_NS', () => {
    mockUseFlag.mockReturnValue(false);
    mockUseFleetAccessReview.mockReturnValue([true, false]);

    const { result } = renderHook(() => useCanListNamespaces('spoke-1'));

    expect(result.current).toBe(true);
    expect(mockUseFleetAccessReview).toHaveBeenCalledWith({
      cluster: 'spoke-1',
      resource: 'namespaces',
      verb: 'list',
    });
  });

  it('with a cluster returns false when the review denies listing namespaces', () => {
    mockUseFlag.mockReturnValue(true);
    mockUseFleetAccessReview.mockReturnValue([false, false]);

    expect(renderHook(() => useCanListNamespaces('spoke-1')).result.current).toBe(false);
  });

  it('with a cluster returns false while the review is in flight', () => {
    mockUseFlag.mockReturnValue(true);
    mockUseFleetAccessReview.mockReturnValue([false, true]);

    expect(renderHook(() => useCanListNamespaces('spoke-1')).result.current).toBe(false);
  });

  it('calls both hooks on every render regardless of cluster (rules of hooks)', () => {
    mockUseFlag.mockReturnValue(true);

    const { rerender } = renderHook(({ cluster }) => useCanListNamespaces(cluster), {
      initialProps: { cluster: undefined as string | undefined },
    });
    rerender({ cluster: 'spoke-1' });
    rerender({ cluster: undefined });

    expect(mockUseFlag).toHaveBeenCalledTimes(3);
    expect(mockUseFleetAccessReview).toHaveBeenCalledTimes(3);
  });
});
