import useFeaturesConfigMap from '@kubevirt-utils/hooks/useFeatures/useFeaturesConfigMap';
import { renderHook } from '@testing-library/react-hooks';

import useDisabledInstanceTypeFamilies from '../useDisabledInstanceTypeFamilies';

jest.mock('@kubevirt-utils/hooks/useFeatures/useFeaturesConfigMap', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@kubevirt-utils/store/operatorNamespace', () => ({
  operatorNamespaceSignal: { value: 'openshift-cnv' },
}));

jest.mock('@multicluster/hooks/useClusterParam', () => ({
  __esModule: true,
  default: jest.fn(() => 'cluster-from-param'),
}));

const mockKubevirtK8sPatch = jest.fn();
jest.mock('@multicluster/k8sRequests', () => ({
  kubevirtK8sPatch: (...args: unknown[]) => mockKubevirtK8sPatch(...args),
}));

const mockUseFeaturesConfigMap = useFeaturesConfigMap as jest.Mock;

const configMap = (disabled?: string) => ({
  data: disabled === undefined ? undefined : { disabledInstanceTypeFamilies: disabled },
  metadata: { name: 'kubevirt-ui-features', resourceVersion: '7' },
});

const mockWatch = (featuresConfigMapData: [unknown, boolean, unknown], isAdmin = true): void => {
  mockUseFeaturesConfigMap.mockReturnValue({ featuresConfigMapData, isAdmin });
};

describe('useDisabledInstanceTypeFamilies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is not loaded until the config map has loaded', () => {
    mockWatch([undefined, false, undefined]);
    const { result } = renderHook(() => useDisabledInstanceTypeFamilies());

    expect(result.current.loaded).toBe(false);
  });

  it('reports loaded and parses the disabled families once loaded', () => {
    mockWatch([configMap('["u1","cx1"]'), true, undefined]);
    const { result } = renderHook(() => useDisabledInstanceTypeFamilies());

    expect(result.current.loaded).toBe(true);
    expect([...result.current.disabledFamilies].sort()).toEqual(['cx1', 'u1']);
    expect(result.current.isFamilyVisible('u1')).toBe(false);
    expect(result.current.isFamilyVisible('m1')).toBe(true);
    expect(result.current.isFamilyVisible('u1', 'u1')).toBe(true);
  });

  it('fails open when the config map watch errors: loaded and every family visible', () => {
    mockWatch([undefined, false, new Error('forbidden')]);
    const { result } = renderHook(() => useDisabledInstanceTypeFamilies());

    expect(result.current.loaded).toBe(true);
    expect(result.current.disabledFamilies.size).toBe(0);
    expect(result.current.isFamilyVisible('u1')).toBe(true);
  });

  it('uses the cluster override over the cluster param', () => {
    mockWatch([configMap('[]'), true, undefined]);
    renderHook(() => useDisabledInstanceTypeFamilies('override-cluster'));

    expect(mockUseFeaturesConfigMap).toHaveBeenCalledWith('override-cluster');
  });

  it('falls back to the cluster param when no override is given', () => {
    mockWatch([configMap('[]'), true, undefined]);
    renderHook(() => useDisabledInstanceTypeFamilies());

    expect(mockUseFeaturesConfigMap).toHaveBeenCalledWith('cluster-from-param');
  });

  it('exposes canEdit from the admin flag', () => {
    mockWatch([configMap('[]'), true, undefined], false);
    const { result } = renderHook(() => useDisabledInstanceTypeFamilies());

    expect(result.current.canEdit).toBe(false);
  });

  it('patches the config map with a resourceVersion guard when disabling a family', async () => {
    mockWatch([configMap('["cx1"]'), true, undefined]);
    mockKubevirtK8sPatch.mockResolvedValue(undefined);
    const { result } = renderHook(() => useDisabledInstanceTypeFamilies());

    await result.current.setFamilyAvailable('u1', false);

    expect(mockKubevirtK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        cluster: 'cluster-from-param',
        data: [
          { op: 'test', path: '/metadata/resourceVersion', value: '7' },
          { op: 'replace', path: '/data/disabledInstanceTypeFamilies', value: '["cx1","u1"]' },
        ],
      }),
    );
  });

  it('adds the key when the config map has no family entry yet', async () => {
    mockWatch([{ data: { other: 'x' }, metadata: { resourceVersion: '1' } }, true, undefined]);
    mockKubevirtK8sPatch.mockResolvedValue(undefined);
    const { result } = renderHook(() => useDisabledInstanceTypeFamilies());

    await result.current.setFamilyAvailable('u1', false);

    expect(mockKubevirtK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          { op: 'test', path: '/metadata/resourceVersion', value: '1' },
          { op: 'add', path: '/data/disabledInstanceTypeFamilies', value: '["u1"]' },
        ],
      }),
    );
  });

  it('rejects updates for non-admin users without patching', async () => {
    mockWatch([configMap('[]'), true, undefined], false);
    const { result } = renderHook(() => useDisabledInstanceTypeFamilies());

    await expect(result.current.setFamilyAvailable('u1', false)).rejects.toThrow('not authorized');
    expect(mockKubevirtK8sPatch).not.toHaveBeenCalled();
  });

  it('rejects updates when the config map is not available', async () => {
    mockWatch([undefined, false, new Error('forbidden')]);
    const { result } = renderHook(() => useDisabledInstanceTypeFamilies());

    await expect(result.current.setFamilyAvailable('u1', false)).rejects.toThrow(
      'Features ConfigMap is not available',
    );
    expect(mockKubevirtK8sPatch).not.toHaveBeenCalled();
  });
});
