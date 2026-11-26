import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import useMulticlusterNamespaces from '@multicluster/hooks/useMulticlusterProjects';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { renderHook } from '@testing-library/react-hooks';

import { useTreeViewData } from './useTreeViewData';

jest.mock('@kubevirt-utils/hooks/useFeatures/useFeatures', () => ({
  useFeatures: jest.fn(() => ({ featureEnabled: false })),
}));

jest.mock('@kubevirt-utils/hooks/useIsAdmin', () => ({
  useIsAdmin: jest.fn(),
}));

jest.mock('@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@kubevirt-utils/hooks/useProjects', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@multicluster/hooks/useMulticlusterProjects', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@multicluster/useIsACMPage', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useK8sWatchResources: jest.fn(),
}));

jest.mock('@stolostron/multicluster-sdk', () => ({
  useFleetClusterNames: jest.fn(() => [[]]),
}));

const mockUseIsAdmin = useIsAdmin as jest.Mock;
const mockUseKubevirtWatchResource = useKubevirtWatchResource as jest.Mock;
const mockUseProjects = useProjects as jest.Mock;
const mockUseMulticlusterNamespaces = useMulticlusterNamespaces as jest.Mock;
const mockUseIsACMPage = useIsACMPage as jest.Mock;
const mockUseK8sWatchResources = useK8sWatchResources as jest.Mock;

const forbiddenError = { code: 403, message: 'Forbidden' };

type WatchResult = { data: unknown[]; loaded: boolean; loadError?: unknown };

const setup = ({
  allowedResources,
  projectsLoaded = true,
}: {
  allowedResources: Record<string, WatchResult>;
  projectsLoaded?: boolean;
}) => {
  mockUseIsAdmin.mockReturnValue(false);
  mockUseIsACMPage.mockReturnValue(false);
  mockUseProjects.mockReturnValue([Object.keys(allowedResources), projectsLoaded, undefined]);
  mockUseMulticlusterNamespaces.mockReturnValue([{}, false, undefined]);
  mockUseKubevirtWatchResource.mockReturnValue([[], false, undefined]);
  // the first call is for the VMs, the second one is for the VMIMs
  mockUseK8sWatchResources.mockImplementation((resources: Record<string, unknown>) =>
    Object.keys(resources).length === 0
      ? {}
      : Object.fromEntries(
          Object.keys(resources).map((namespace) => [
            namespace,
            allowedResources[namespace] ?? { data: [], loaded: false },
          ]),
        ),
  );
};

describe('useTreeViewData - per-namespace loading (non-admin user)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is loaded when a per-namespace resource has loaded: true', () => {
    setup({
      allowedResources: {
        'ns-a': { data: [], loaded: true },
        'ns-b': { data: [], loaded: false },
      },
    });

    const { result } = renderHook(() => useTreeViewData());

    expect(result.current.loaded).toBe(true);
  });

  it('is loaded when per-namespace resources have loaded: false but loadError set (e.g. 403)', () => {
    setup({
      allowedResources: {
        'ns-a': { data: [], loaded: false, loadError: forbiddenError },
        'ns-b': { data: [], loaded: false, loadError: forbiddenError },
      },
    });

    const { result } = renderHook(() => useTreeViewData());

    expect(result.current.loaded).toBe(true);
  });

  it('is not loaded when all per-namespace resources have loaded: false and no loadError', () => {
    setup({
      allowedResources: {
        'ns-a': { data: [], loaded: false },
        'ns-b': { data: [], loaded: false, loadError: undefined },
      },
    });

    const { result } = renderHook(() => useTreeViewData());

    expect(result.current.loaded).toBe(false);
    expect(result.current.treeData).toEqual([]);
  });

  it('is not loaded when projects have not loaded, even if resources have loaded', () => {
    setup({
      allowedResources: {
        'ns-a': { data: [], loaded: true },
      },
      projectsLoaded: false,
    });

    const { result } = renderHook(() => useTreeViewData());

    expect(result.current.loaded).toBe(false);
  });
});
