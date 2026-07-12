import { HyperConvergedModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { renderHook } from '@testing-library/react';

import { KUBEVIRT_JSONPATCH_ANNOTATION } from '../../utils/featureGateAnnotation';

import { ADD_VSOCK_FEATURE_GATE_PATCH } from '../constants';

import {
  annotationPath,
  createHyperConverged,
  mockFeatureEnabled,
  mockHCConfiguration,
  mockKubevirtK8sPatch,
  resetVSOCKMocks,
} from './mocks';

jest.mock('@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration', () => ({
  __esModule: true,
  default: () => ({}),
}));

jest.mock('@kubevirt-utils/hooks/useHyperConvergeConfiguration', () => ({
  __esModule: true,
  default: () => mockHCConfiguration(),
}));

jest.mock('@kubevirt-utils/hooks/useIsAdmin', () => ({
  useIsAdmin: () => true,
}));

jest.mock('@kubevirt-utils/hooks/useVSOCKFeatureFlag/useIsVSOCKFeatureEnabled', () => ({
  __esModule: true,
  default: () => mockFeatureEnabled(),
}));

jest.mock('@multicluster/hooks/useClusterParam', () => ({
  __esModule: true,
  default: () => '',
}));

jest.mock('@multicluster/k8sRequests', () => ({
  kubevirtK8sPatch: (...args: unknown[]) => mockKubevirtK8sPatch(...args),
}));

describe('useVSOCKFeatureFlag — toggling the feature gate ON/OFF', () => {
  let useVSOCKFeatureFlag: typeof import('../useVSOCKFeatureFlag').default;

  beforeEach(() => {
    resetVSOCKMocks();
    useVSOCKFeatureFlag = jest.requireActual('../useVSOCKFeatureFlag').default;
  });

  it('should produce the correct HC patch when toggled ON from a clean HC', async () => {
    const hc = createHyperConverged();
    mockHCConfiguration.mockReturnValue([hc, true, null]);
    mockFeatureEnabled.mockReturnValue({ featureEnabled: false, isLoading: false });

    const { result } = renderHook(() => useVSOCKFeatureFlag());
    await result.current.toggleFeature(true);

    expect(mockKubevirtK8sPatch).toHaveBeenCalledTimes(1);

    const { model, resource, data } = mockKubevirtK8sPatch.mock.calls[0][0];

    expect(model).toBe(HyperConvergedModel);
    expect(resource).toBe(hc);

    expect(data).toEqual([
      { op: 'add', path: '/metadata/annotations', value: {} },
      {
        op: 'add',
        path: annotationPath,
        value: JSON.stringify([
          {
            op: 'add',
            path: '/spec/configuration/developerConfiguration/featureGates/-',
            value: 'VSOCK',
          },
        ]),
      },
    ]);
  });

  it('should produce the correct HC patch when toggled OFF', async () => {
    const hc = createHyperConverged({
      [KUBEVIRT_JSONPATCH_ANNOTATION]: JSON.stringify([ADD_VSOCK_FEATURE_GATE_PATCH]),
    });
    mockHCConfiguration.mockReturnValue([hc, true, null]);
    mockFeatureEnabled.mockReturnValue({ featureEnabled: true, isLoading: false });

    const { result } = renderHook(() => useVSOCKFeatureFlag());
    await result.current.toggleFeature(false);

    const { model, resource, data } = mockKubevirtK8sPatch.mock.calls[0][0];

    expect(model).toBe(HyperConvergedModel);
    expect(resource).toBe(hc);

    expect(data).toEqual([{ op: 'replace', path: annotationPath, value: JSON.stringify([]) }]);
  });

  it('should not duplicate the VSOCK entry if already present', async () => {
    const hc = createHyperConverged({
      [KUBEVIRT_JSONPATCH_ANNOTATION]: JSON.stringify([ADD_VSOCK_FEATURE_GATE_PATCH]),
    });
    mockHCConfiguration.mockReturnValue([hc, true, null]);
    mockFeatureEnabled.mockReturnValue({ featureEnabled: true, isLoading: false });

    const { result } = renderHook(() => useVSOCKFeatureFlag());
    await result.current.toggleFeature(true);

    const { data } = mockKubevirtK8sPatch.mock.calls[0][0];
    const annotationValue = JSON.parse(
      data.find((p: { path: string }) => p.path === annotationPath).value,
    );

    expect(annotationValue).toHaveLength(1);
    expect(annotationValue[0]).toEqual({
      op: 'add',
      path: '/spec/configuration/developerConfiguration/featureGates/-',
      value: 'VSOCK',
    });
  });

  it('should keep other feature gates intact when adding VSOCK', async () => {
    const otherPatch = { op: 'add', path: '/some/other/path', value: 'OtherFeature' };
    const hc = createHyperConverged({
      [KUBEVIRT_JSONPATCH_ANNOTATION]: JSON.stringify([otherPatch]),
    });
    mockHCConfiguration.mockReturnValue([hc, true, null]);
    mockFeatureEnabled.mockReturnValue({ featureEnabled: false, isLoading: false });

    const { result } = renderHook(() => useVSOCKFeatureFlag());
    await result.current.toggleFeature(true);

    const { data } = mockKubevirtK8sPatch.mock.calls[0][0];
    const annotationValue = JSON.parse(
      data.find((p: { path: string }) => p.path === annotationPath).value,
    );

    expect(annotationValue).toEqual([
      otherPatch,
      {
        op: 'add',
        path: '/spec/configuration/developerConfiguration/featureGates/-',
        value: 'VSOCK',
      },
    ]);
  });

  it('should keep other feature gates intact when removing VSOCK', async () => {
    const otherPatch = { op: 'add', path: '/some/other/path', value: 'OtherFeature' };
    const hc = createHyperConverged({
      [KUBEVIRT_JSONPATCH_ANNOTATION]: JSON.stringify([otherPatch, ADD_VSOCK_FEATURE_GATE_PATCH]),
    });
    mockHCConfiguration.mockReturnValue([hc, true, null]);
    mockFeatureEnabled.mockReturnValue({ featureEnabled: true, isLoading: false });

    const { result } = renderHook(() => useVSOCKFeatureFlag());
    await result.current.toggleFeature(false);

    const { data } = mockKubevirtK8sPatch.mock.calls[0][0];
    const annotationValue = JSON.parse(
      data.find((p: { path: string }) => p.path === annotationPath).value,
    );

    expect(annotationValue).toEqual([otherPatch]);
  });

  it('should reject when HC configuration is not loaded', async () => {
    mockHCConfiguration.mockReturnValue([undefined, false, null]);
    mockFeatureEnabled.mockReturnValue({ featureEnabled: false, isLoading: true });

    const { result } = renderHook(() => useVSOCKFeatureFlag());

    await expect(result.current.toggleFeature(true)).rejects.toThrow(
      'HyperConverged configuration is not loaded',
    );

    expect(mockKubevirtK8sPatch).not.toHaveBeenCalled();
  });
});
