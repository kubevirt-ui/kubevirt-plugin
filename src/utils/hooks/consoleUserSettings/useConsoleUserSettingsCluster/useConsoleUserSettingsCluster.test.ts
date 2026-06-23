import { renderHook } from '@testing-library/react';

import { HUB_CLUSTER_NAME, MANAGED_CLUSTER_NAME } from '../tests/constants';

import useConsoleUserSettingsCluster from './useConsoleUserSettingsCluster';

const mockUseIsACMPage = jest.fn();
const mockUseHubClusterName = jest.fn();

jest.mock('@multicluster/useIsACMPage', () => ({
  __esModule: true,
  default: () => mockUseIsACMPage(),
}));

jest.mock('@stolostron/multicluster-sdk', () => ({
  useHubClusterName: () => mockUseHubClusterName(),
}));

describe('useConsoleUserSettingsCluster', () => {
  beforeEach(() => {
    mockUseHubClusterName.mockReturnValue([HUB_CLUSTER_NAME]);
  });

  it('returns undefined on non-ACM pages regardless of cluster input', () => {
    mockUseIsACMPage.mockReturnValue(false);

    const { rerender, result } = renderHook(
      ({ cluster }) => useConsoleUserSettingsCluster(cluster),
      {
        initialProps: { cluster: HUB_CLUSTER_NAME as string | undefined },
      },
    );

    expect(result.current).toBeUndefined();

    rerender({ cluster: MANAGED_CLUSTER_NAME });
    expect(result.current).toBeUndefined();
  });

  it('returns hub cluster on ACM pages when no cluster is provided', () => {
    mockUseIsACMPage.mockReturnValue(true);

    const { result } = renderHook(() => useConsoleUserSettingsCluster(undefined));

    expect(result.current).toBe(HUB_CLUSTER_NAME);
  });

  it('returns explicit cluster on ACM pages when provided', () => {
    mockUseIsACMPage.mockReturnValue(true);

    const { result } = renderHook(() => useConsoleUserSettingsCluster(MANAGED_CLUSTER_NAME));

    expect(result.current).toBe(MANAGED_CLUSTER_NAME);
  });
});
