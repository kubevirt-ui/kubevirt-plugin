import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useHubClusterName } from '@stolostron/multicluster-sdk';
import { act, renderHook } from '@testing-library/react';

import useFamilyAvailabilityCluster from './useFamilyAvailabilityCluster';

jest.mock('@multicluster/hooks/useClusterParam', () => jest.fn());
jest.mock('@multicluster/useIsACMPage', () => jest.fn());
jest.mock('@stolostron/multicluster-sdk', () => ({ useHubClusterName: jest.fn() }));

const mockUseClusterParam = jest.mocked(useClusterParam);
const mockUseIsACMPage = jest.mocked(useIsACMPage);
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
    mockUseIsACMPage.mockReturnValue(false);
    mockUseClusterParam.mockReturnValue(undefined);

    const { result } = renderHook(() => useFamilyAvailabilityCluster());

    expect(result.current.showClusterSelector).toBe(false);
    expect(result.current.cluster).toBeUndefined();
    expect(result.current.selectedCluster).toBeUndefined();
    expect(result.current.hasUserSelectedCluster).toBe(false);
  });

  it('ACM single-cluster route: shows the selector and defaults to the URL cluster', () => {
    mockUseIsACMPage.mockReturnValue(true);
    mockUseClusterParam.mockReturnValue('spoke-a');

    const { result } = renderHook(() => useFamilyAvailabilityCluster());

    expect(result.current.showClusterSelector).toBe(true);
    expect(result.current.selectedCluster).toBe('spoke-a');
    expect(result.current.cluster).toBe('spoke-a');
    expect(result.current.hasUserSelectedCluster).toBe(false);

    act(() => result.current.onClusterChange('spoke-b'));
    expect(result.current.hasUserSelectedCluster).toBe(true);

    expect(result.current.selectedCluster).toBe('spoke-b');
    expect(result.current.cluster).toBe('spoke-b');
  });

  it('ACM All clusters: defaults to the hub and switches to the selected cluster', () => {
    mockUseIsACMPage.mockReturnValue(true);
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
    mockUseIsACMPage.mockReturnValue(true);
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
