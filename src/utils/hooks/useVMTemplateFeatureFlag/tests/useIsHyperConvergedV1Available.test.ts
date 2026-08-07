import useClusterParam from '@multicluster/hooks/useClusterParam';
import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';
import { renderHook, waitFor } from '@testing-library/react';

import useHyperConvergedAPIDiscovery from '../useHyperConvergedAPIDiscovery';
import useIsHyperConvergedV1Available from '../useIsHyperConvergedV1Available';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useK8sModel: jest.fn(),
}));

jest.mock('@stolostron/multicluster-sdk', () => ({
  useHubClusterName: jest.fn(),
}));

jest.mock('@multicluster/hooks/useClusterParam', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../useHyperConvergedAPIDiscovery', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseK8sModel = useK8sModel as jest.Mock;
const mockUseHubClusterName = useHubClusterName as jest.Mock;
const mockUseClusterParam = useClusterParam as jest.Mock;
const mockUseHyperConvergedAPIDiscovery = useHyperConvergedAPIDiscovery as jest.Mock;

const HUB = 'hub-cluster';
const SPOKE = 'spoke-a';

describe('useIsHyperConvergedV1Available', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseClusterParam.mockReturnValue(undefined);
    mockUseHubClusterName.mockReturnValue([HUB, true, undefined]);
    mockUseK8sModel.mockReturnValue([{ kind: 'HyperConverged' }, false]);
    mockUseHyperConvergedAPIDiscovery.mockReturnValue({
      loading: false,
      preferredVersion: undefined,
    });
  });

  it('uses useK8sModel on the hub cluster', () => {
    mockUseClusterParam.mockReturnValue(HUB);

    const { result } = renderHook(() => useIsHyperConvergedV1Available());

    expect(mockUseHyperConvergedAPIDiscovery).toHaveBeenCalledWith(undefined);
    expect(result.current).toEqual({ isHCOV1: true, loading: false });
  });

  it('uses useK8sModel when no cluster is selected', () => {
    const { result } = renderHook(() => useIsHyperConvergedV1Available());

    expect(mockUseHyperConvergedAPIDiscovery).toHaveBeenCalledWith(undefined);
    expect(result.current).toEqual({ isHCOV1: true, loading: false });
  });

  it('uses discovery preferredVersion on a managed cluster', () => {
    mockUseClusterParam.mockReturnValue(SPOKE);
    mockUseHyperConvergedAPIDiscovery.mockReturnValue({
      loading: false,
      preferredVersion: 'v1',
    });

    const { result } = renderHook(() => useIsHyperConvergedV1Available());

    expect(mockUseHyperConvergedAPIDiscovery).toHaveBeenCalledWith(SPOKE);
    expect(result.current).toEqual({ isHCOV1: true, loading: false });
  });

  it('returns unavailable when managed preferredVersion is v1beta1', () => {
    mockUseClusterParam.mockReturnValue(SPOKE);
    mockUseHyperConvergedAPIDiscovery.mockReturnValue({
      loading: false,
      preferredVersion: 'v1beta1',
    });

    const { result } = renderHook(() => useIsHyperConvergedV1Available());

    expect(result.current).toEqual({ isHCOV1: false, loading: false });
  });

  it('honors clusterOverride for managed discovery', () => {
    mockUseClusterParam.mockReturnValue(HUB);
    mockUseHyperConvergedAPIDiscovery.mockReturnValue({
      loading: false,
      preferredVersion: 'v1',
    });

    const { result } = renderHook(() => useIsHyperConvergedV1Available(SPOKE));

    expect(mockUseHyperConvergedAPIDiscovery).toHaveBeenCalledWith(SPOKE);
    expect(result.current).toEqual({ isHCOV1: true, loading: false });
  });

  it('stays loading until hub cluster name is resolved when a cluster is set', async () => {
    mockUseClusterParam.mockReturnValue(SPOKE);
    mockUseHubClusterName.mockReturnValue([undefined, false, undefined]);

    const { rerender, result } = renderHook(() => useIsHyperConvergedV1Available());

    expect(result.current).toEqual({ isHCOV1: false, loading: true });

    mockUseHubClusterName.mockReturnValue([HUB, true, undefined]);
    mockUseHyperConvergedAPIDiscovery.mockReturnValue({
      loading: false,
      preferredVersion: 'v1',
    });

    rerender();

    await waitFor(() => expect(result.current).toEqual({ isHCOV1: true, loading: false }));
  });

  it('falls back to useK8sModel when hub cluster name fails to load', () => {
    mockUseClusterParam.mockReturnValue(SPOKE);
    mockUseHubClusterName.mockReturnValue([undefined, false, new Error('hub unavailable')]);

    const { result } = renderHook(() => useIsHyperConvergedV1Available());

    expect(mockUseHyperConvergedAPIDiscovery).toHaveBeenCalledWith(undefined);
    expect(result.current).toEqual({ isHCOV1: true, loading: false });
  });

  it('surfaces discovery loading state on managed clusters', () => {
    mockUseClusterParam.mockReturnValue(SPOKE);
    mockUseHyperConvergedAPIDiscovery.mockReturnValue({
      loading: true,
      preferredVersion: undefined,
    });

    const { result } = renderHook(() => useIsHyperConvergedV1Available());

    expect(result.current).toEqual({ isHCOV1: false, loading: true });
  });
});
