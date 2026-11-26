import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { renderHook } from '@testing-library/react';

import useDisabledInstanceTypeFamilies from './useDisabledInstanceTypeFamilies';

jest.mock('@multicluster/hooks/useClusterParam', () => jest.fn());
jest.mock('@multicluster/hooks/useK8sWatchData', () => jest.fn());
jest.mock('@multicluster/k8sRequests', () => ({ kubevirtK8sPatch: jest.fn() }));
jest.mock('@stolostron/multicluster-sdk', () => ({ useFleetAccessReview: jest.fn() }));
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  getGroupVersionKindForModel: jest.fn(() => ({ kind: 'ConfigMap', version: 'v1' })),
}));

const mockUseClusterParam = jest.mocked(useClusterParam);
const mockUseK8sWatchData = jest.mocked(useK8sWatchData);
const mockUseFleetAccessReview = jest.mocked(useFleetAccessReview);
const mockPatch = jest.mocked(kubevirtK8sPatch);

const configMap = {
  data: { disabledInstanceTypeFamilies: '["o1"]' },
  metadata: { name: 'kubevirt-ui-features', namespace: 'openshift-cnv', resourceVersion: '42' },
};

describe('useDisabledInstanceTypeFamilies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    operatorNamespaceSignal.value = 'openshift-cnv';
    mockUseClusterParam.mockReturnValue('url-cluster');
    mockUseK8sWatchData.mockReturnValue([configMap, true, undefined] as ReturnType<
      typeof useK8sWatchData
    >);
    mockUseFleetAccessReview.mockReturnValue([true, false] as ReturnType<
      typeof useFleetAccessReview
    >);
    mockPatch.mockResolvedValue(undefined);
  });

  it('propagates the cluster override to the watch, access review and patch', async () => {
    const { result } = renderHook(() => useDisabledInstanceTypeFamilies('spoke-a'));

    expect(mockUseK8sWatchData).toHaveBeenCalledWith(
      expect.objectContaining({ cluster: 'spoke-a', name: 'kubevirt-ui-features' }),
    );
    expect(mockUseFleetAccessReview).toHaveBeenCalledWith(
      expect.objectContaining({ cluster: 'spoke-a', verb: 'patch' }),
    );

    await result.current.setFamilyAvailable('m1', false);

    expect(mockPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        cluster: 'spoke-a',
        data: [
          { op: 'test', path: '/metadata/resourceVersion', value: '42' },
          { op: 'replace', path: '/data/disabledInstanceTypeFamilies', value: '["m1","o1"]' },
        ],
      }),
    );
  });

  it('falls back to the URL cluster param when no override is given', () => {
    renderHook(() => useDisabledInstanceTypeFamilies());

    expect(mockUseK8sWatchData).toHaveBeenCalledWith(
      expect.objectContaining({ cluster: 'url-cluster' }),
    );
    expect(mockUseFleetAccessReview).toHaveBeenCalledWith(
      expect.objectContaining({ cluster: 'url-cluster' }),
    );
  });

  it('exposes canEditLoaded from the access review loading state', () => {
    mockUseFleetAccessReview.mockReturnValue([false, true] as ReturnType<
      typeof useFleetAccessReview
    >);
    const { rerender, result } = renderHook(() => useDisabledInstanceTypeFamilies('spoke-b'));

    expect(result.current.canEditLoaded).toBe(false);

    mockUseFleetAccessReview.mockReturnValue([false, false] as ReturnType<
      typeof useFleetAccessReview
    >);
    rerender();

    expect(result.current.canEditLoaded).toBe(true);
    expect(result.current.canEdit).toBe(false);
  });

  it('throws and does not patch when the user cannot edit', async () => {
    mockUseFleetAccessReview.mockReturnValue([false, false] as ReturnType<
      typeof useFleetAccessReview
    >);
    const { result } = renderHook(() => useDisabledInstanceTypeFamilies('spoke-b'));

    await expect(result.current.setFamilyAvailable('m1', false)).rejects.toThrow('not authorized');
    expect(mockPatch).not.toHaveBeenCalled();
  });

  it('re-enabling a family removes it from the serialized list', async () => {
    const { result } = renderHook(() => useDisabledInstanceTypeFamilies('spoke-a'));

    await result.current.setFamilyAvailable('o1', true);

    expect(mockPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          { op: 'replace', path: '/data/disabledInstanceTypeFamilies', value: '[]' },
        ]),
      }),
    );
  });
});
