import { renderHook } from '@testing-library/react';

import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import useIsOpenShiftPipelinesInstalled from './useIsOpenShiftPipelinesInstalled';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useK8sModel: jest.fn(),
}));

const mockedUseK8sModel = useK8sModel as jest.Mock;

describe('useIsOpenShiftPipelinesInstalled', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return not installed while model discovery is still in flight', () => {
    mockedUseK8sModel.mockReturnValue([undefined, true]);

    const { result } = renderHook(() => useIsOpenShiftPipelinesInstalled());

    expect(result.current).toEqual([false, false]);
  });

  it('should return not installed once loaded and the Pipeline model is empty', () => {
    mockedUseK8sModel.mockReturnValue([undefined, false]);

    const { result } = renderHook(() => useIsOpenShiftPipelinesInstalled());

    expect(result.current).toEqual([false, true]);
  });

  it('should return installed once loaded and the Pipeline model is present', () => {
    mockedUseK8sModel.mockReturnValue([
      { apiVersion: 'v1', kind: 'Pipeline', plural: 'pipelines' },
      false,
    ]);

    const { result } = renderHook(() => useIsOpenShiftPipelinesInstalled());

    expect(result.current).toEqual([true, true]);
  });

  it('should request the tekton.dev/v1 Pipeline group version kind', () => {
    mockedUseK8sModel.mockReturnValue([undefined, false]);

    renderHook(() => useIsOpenShiftPipelinesInstalled());

    expect(mockedUseK8sModel).toHaveBeenCalledWith({
      group: 'tekton.dev',
      kind: 'Pipeline',
      version: 'v1',
    });
  });
});
