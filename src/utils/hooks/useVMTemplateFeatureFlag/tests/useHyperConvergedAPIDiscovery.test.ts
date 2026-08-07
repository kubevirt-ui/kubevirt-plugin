import { createElement, type FC } from 'react';

import { clearHCOAPIDiscoveryCache } from '@kubevirt-utils/store/hcoAPIDiscovery';
import useK8sBaseAPIPath from '@multicluster/hooks/useK8sBaseAPIPath';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';
import { render, renderHook, screen, waitFor } from '@testing-library/react';

import useHyperConvergedAPIDiscovery from '../useHyperConvergedAPIDiscovery';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  consoleFetchJSON: jest.fn(),
}));

jest.mock('@multicluster/hooks/useK8sBaseAPIPath', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseK8sBaseAPIPath = useK8sBaseAPIPath as jest.Mock;
const mockConsoleFetchJSON = consoleFetchJSON as unknown as jest.Mock;

const SPOKE = 'spoke-a';
const SPOKE_API_PATH = `/api/proxy/plugin/mce/console/multicloud/managedclusterproxy/${SPOKE}`;

describe('useHyperConvergedAPIDiscovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearHCOAPIDiscoveryCache();
    mockUseK8sBaseAPIPath.mockReturnValue([SPOKE_API_PATH, true]);
    mockConsoleFetchJSON.mockResolvedValue({ preferredVersion: { version: 'v1' } });
  });

  it('skips discovery when cluster is undefined', () => {
    const { result } = renderHook(() => useHyperConvergedAPIDiscovery());

    expect(mockUseK8sBaseAPIPath).toHaveBeenCalledWith(undefined);
    expect(mockConsoleFetchJSON).not.toHaveBeenCalled();
    expect(result.current).toEqual({ loading: false, preferredVersion: undefined });
  });

  it('fetches preferredVersion for a managed cluster', async () => {
    mockConsoleFetchJSON.mockResolvedValue({
      preferredVersion: { groupVersion: 'hco.kubevirt.io/v1', version: 'v1' },
    });

    const { result } = renderHook(() => useHyperConvergedAPIDiscovery(SPOKE));

    await waitFor(() => expect(result.current).toEqual({ loading: false, preferredVersion: 'v1' }));

    expect(mockUseK8sBaseAPIPath).toHaveBeenCalledWith(SPOKE);
    expect(mockConsoleFetchJSON).toHaveBeenCalledWith(`${SPOKE_API_PATH}/apis/hco.kubevirt.io`);
  });

  it('returns undefined preferredVersion when discovery fails', async () => {
    mockConsoleFetchJSON.mockRejectedValue(new Error('Not Found'));

    const { result } = renderHook(() => useHyperConvergedAPIDiscovery(SPOKE));

    await waitFor(() =>
      expect(result.current).toEqual({ loading: false, preferredVersion: undefined }),
    );
  });

  it('waits for the API path before discovering', async () => {
    mockUseK8sBaseAPIPath.mockReturnValue([undefined, false]);

    const { rerender, result } = renderHook(() => useHyperConvergedAPIDiscovery(SPOKE));

    expect(result.current).toEqual({ loading: true, preferredVersion: undefined });
    expect(mockConsoleFetchJSON).not.toHaveBeenCalled();

    mockUseK8sBaseAPIPath.mockReturnValue([SPOKE_API_PATH, true]);
    mockConsoleFetchJSON.mockResolvedValue({ preferredVersion: { version: 'v1beta1' } });

    rerender();

    await waitFor(() =>
      expect(result.current).toEqual({ loading: false, preferredVersion: 'v1beta1' }),
    );
  });

  it('shares a single discovery request across multiple hook instances', async () => {
    mockConsoleFetchJSON.mockResolvedValue({ preferredVersion: { version: 'v1' } });

    const { result: first } = renderHook(() => useHyperConvergedAPIDiscovery(SPOKE));
    const { result: second } = renderHook(() => useHyperConvergedAPIDiscovery(SPOKE));

    await waitFor(() => {
      expect(first.current).toEqual({ loading: false, preferredVersion: 'v1' });
      expect(second.current).toEqual({ loading: false, preferredVersion: 'v1' });
    });

    expect(mockConsoleFetchJSON).toHaveBeenCalledTimes(1);
  });

  it('shares a single discovery request when two consumers mount together', async () => {
    mockConsoleFetchJSON.mockResolvedValue({ preferredVersion: { version: 'v1' } });

    const DualMount: FC = () => {
      const first = useHyperConvergedAPIDiscovery(SPOKE);
      const second = useHyperConvergedAPIDiscovery(SPOKE);

      return createElement(
        'div',
        null,
        createElement('span', { 'data-test-id': 'first' }, JSON.stringify(first)),
        createElement('span', { 'data-test-id': 'second' }, JSON.stringify(second)),
      );
    };

    render(createElement(DualMount));

    await waitFor(() => {
      expect(JSON.parse(screen.getByTestId('first').textContent ?? '')).toEqual({
        loading: false,
        preferredVersion: 'v1',
      });
      expect(JSON.parse(screen.getByTestId('second').textContent ?? '')).toEqual({
        loading: false,
        preferredVersion: 'v1',
      });
    });

    expect(mockConsoleFetchJSON).toHaveBeenCalledTimes(1);
  });
});
