import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import { useHubClusterName } from '@stolostron/multicluster-sdk';
import { act, renderHook } from '@testing-library/react';

import useFamilyAvailabilityCluster from './useFamilyAvailabilityCluster';

jest.mock('@multicluster/hooks/useClusterParam', () => jest.fn());
jest.mock('@multicluster/hooks/useIsAllClustersPage', () => jest.fn());
jest.mock('@stolostron/multicluster-sdk', () => ({ useHubClusterName: jest.fn() }));

const mockUseClusterParam = jest.mocked(useClusterParam);
const mockUseIsAllClustersPage = jest.mocked(useIsAllClustersPage);
const mockUseHubClusterName = jest.mocked(useHubClusterName);

const setHub = (name: string | undefined, loaded = true): void => {
  mockUseHubClusterName.mockReturnValue([name, loaded, undefined] as ReturnType<
    typeof useHubClusterName
  >);
};

describe('useFamilyAvailabilityCluster', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setHub('local-cluster');
  });

  it('standalone console: no selector and no cluster', () => {
    mockUseIsAllClustersPage.mockReturnValue(false);
    mockUseClusterParam.mockReturnValue(undefined);

    const { result } = renderHook(() => useFamilyAvailabilityCluster());

    expect(result.current.showClusterSelector).toBe(false);
    expect(result.current.cluster).toBeUndefined();
    expect(result.current.selectedCluster).toBeUndefined();
  });

  it('ACM single-cluster route: uses the URL cluster and hides the selector', () => {
    mockUseIsAllClustersPage.mockReturnValue(false);
    mockUseClusterParam.mockReturnValue('spoke-a');

    const { result } = renderHook(() => useFamilyAvailabilityCluster());

    expect(result.current.showClusterSelector).toBe(false);
    expect(result.current.cluster).toBe('spoke-a');
  });

  it('ACM All clusters: defaults to the hub and switches to the selected cluster', () => {
    mockUseIsAllClustersPage.mockReturnValue(true);
    mockUseClusterParam.mockReturnValue(undefined);

    const { result } = renderHook(() => useFamilyAvailabilityCluster());

    expect(result.current.showClusterSelector).toBe(true);
    expect(result.current.selectedCluster).toBe('local-cluster');
    expect(result.current.cluster).toBe('local-cluster');

    act(() => result.current.onClusterChange('spoke-a'));

    expect(result.current.selectedCluster).toBe('spoke-a');
    expect(result.current.cluster).toBe('spoke-a');
  });

  it('ACM All clusters: cluster stays undefined until the hub name loads', () => {
    mockUseIsAllClustersPage.mockReturnValue(true);
    mockUseClusterParam.mockReturnValue(undefined);
    setHub(undefined, false);

    const { rerender, result } = renderHook(() => useFamilyAvailabilityCluster());

    expect(result.current.showClusterSelector).toBe(true);
    expect(result.current.cluster).toBeUndefined();

    setHub('local-cluster');
    rerender();

    expect(result.current.cluster).toBe('local-cluster');
  });
});
