import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { renderHook } from '@testing-library/react';

import useCanPatchFeaturesConfigMap from './useCanPatchFeaturesConfigMap';

jest.mock('@multicluster/hooks/useClusterParam', () => jest.fn());
jest.mock('@stolostron/multicluster-sdk', () => ({ useFleetAccessReview: jest.fn() }));
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  getGroupVersionKindForModel: jest.fn(() => ({ kind: 'ConfigMap', version: 'v1' })),
}));

const mockUseClusterParam = jest.mocked(useClusterParam);
const mockUseFleetAccessReview = jest.mocked(useFleetAccessReview);

describe('useCanPatchFeaturesConfigMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    operatorNamespaceSignal.value = 'openshift-cnv';
    mockUseClusterParam.mockReturnValue(undefined);
    mockUseFleetAccessReview.mockReturnValue([true, false] as ReturnType<
      typeof useFleetAccessReview
    >);
  });

  it('reviews the patch verb on the features ConfigMap in the operator namespace', () => {
    renderHook(() => useCanPatchFeaturesConfigMap());

    expect(mockUseFleetAccessReview).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'kubevirt-ui-features',
        namespace: 'openshift-cnv',
        resource: 'configmaps',
        verb: 'patch',
      }),
    );
  });

  it('returns the access review result when it is loaded', () => {
    const { result } = renderHook(() => useCanPatchFeaturesConfigMap());

    expect(result.current).toEqual([true, false]);
  });

  it('returns false when the user cannot patch the ConfigMap', () => {
    mockUseFleetAccessReview.mockReturnValue([false, false] as ReturnType<
      typeof useFleetAccessReview
    >);

    const { result } = renderHook(() => useCanPatchFeaturesConfigMap());

    expect(result.current).toEqual([false, false]);
  });

  it('reports loading while the access review is loading', () => {
    mockUseFleetAccessReview.mockReturnValue([false, true] as ReturnType<
      typeof useFleetAccessReview
    >);

    const { result } = renderHook(() => useCanPatchFeaturesConfigMap());

    expect(result.current).toEqual([false, true]);
  });

  it('fails closed and skips the review while the operator namespace is unknown', () => {
    operatorNamespaceSignal.value = undefined;

    const { result } = renderHook(() => useCanPatchFeaturesConfigMap());

    expect(result.current).toEqual([false, true]);
    expect(mockUseFleetAccessReview).toHaveBeenCalledWith({});
  });

  it('uses the cluster override over the cluster URL param', () => {
    mockUseClusterParam.mockReturnValue('spoke-a');

    renderHook(() => useCanPatchFeaturesConfigMap('spoke-b'));

    expect(mockUseFleetAccessReview).toHaveBeenCalledWith(
      expect.objectContaining({ cluster: 'spoke-b' }),
    );
  });

  it('falls back to the cluster URL param when no override is given', () => {
    mockUseClusterParam.mockReturnValue('spoke-a');

    renderHook(() => useCanPatchFeaturesConfigMap());

    expect(mockUseFleetAccessReview).toHaveBeenCalledWith(
      expect.objectContaining({ cluster: 'spoke-a' }),
    );
  });
});
