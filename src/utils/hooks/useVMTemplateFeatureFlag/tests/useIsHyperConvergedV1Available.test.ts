import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { renderHook, waitFor } from '@testing-library/react';

import { HyperConvergedV1GroupVersionKind } from '../constants';
import useIsHyperConvergedV1Available from '../useIsHyperConvergedV1Available';

jest.mock('@kubevirt-utils/store/operatorNamespace', () => ({
  operatorNamespaceSignal: { value: 'openshift-cnv' },
}));

jest.mock('@multicluster/hooks/useClusterParam', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@multicluster/hooks/useK8sWatchData', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseClusterParam = useClusterParam as jest.Mock;
const mockUseK8sWatchData = useK8sWatchData as jest.Mock;

describe('useIsHyperConvergedV1Available', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    operatorNamespaceSignal.value = 'openshift-cnv';
    mockUseClusterParam.mockReturnValue(undefined);
  });

  it('passes the default cluster to useK8sWatchData', () => {
    mockUseClusterParam.mockReturnValue('hub');
    mockUseK8sWatchData.mockReturnValue([[], true, undefined]);

    renderHook(() => useIsHyperConvergedV1Available());

    expect(mockUseK8sWatchData).toHaveBeenCalledWith({
      cluster: 'hub',
      groupVersionKind: HyperConvergedV1GroupVersionKind,
      isList: true,
      namespace: 'openshift-cnv',
    });
  });

  it('passes an explicit clusterOverride to useK8sWatchData', () => {
    mockUseClusterParam.mockReturnValue('hub');
    mockUseK8sWatchData.mockReturnValue([[], true, undefined]);

    renderHook(() => useIsHyperConvergedV1Available('spoke-a'));

    expect(mockUseK8sWatchData).toHaveBeenCalledWith({
      cluster: 'spoke-a',
      groupVersionKind: HyperConvergedV1GroupVersionKind,
      isList: true,
      namespace: 'openshift-cnv',
    });
  });

  it('should update availability after the HCO v1 probe completes', async () => {
    mockUseK8sWatchData.mockReturnValue([[], false, undefined]);

    const { rerender, result } = renderHook(() => useIsHyperConvergedV1Available());

    expect(result.current).toEqual({ isHCOV1: false, loading: true });

    mockUseK8sWatchData.mockReturnValue([[], true, undefined]);
    rerender();

    await waitFor(() => expect(result.current).toEqual({ isHCOV1: true, loading: false }));
  });

  it('returns available when the watch succeeds', () => {
    mockUseK8sWatchData.mockReturnValue([[], true, undefined]);

    const { result } = renderHook(() => useIsHyperConvergedV1Available());

    expect(result.current).toEqual({ isHCOV1: true, loading: false });
  });

  it('returns unavailable for 404 responses', () => {
    mockUseK8sWatchData.mockReturnValue([[], true, { code: 404 }]);

    const { result } = renderHook(() => useIsHyperConvergedV1Available());

    expect(result.current).toEqual({ isHCOV1: false, loading: false });
  });

  it('returns available for 403 responses', () => {
    mockUseK8sWatchData.mockReturnValue([[], true, { response: { status: 403 } }]);

    const { result } = renderHook(() => useIsHyperConvergedV1Available());

    expect(result.current).toEqual({ isHCOV1: true, loading: false });
  });

  it('returns unavailable for indeterminate non-HTTP failures', () => {
    mockUseK8sWatchData.mockReturnValue([[], true, new Error('Network Error')]);

    const { result } = renderHook(() => useIsHyperConvergedV1Available());

    expect(result.current).toEqual({ isHCOV1: false, loading: false });
  });
});
