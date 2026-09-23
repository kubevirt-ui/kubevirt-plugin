import { act } from 'react-dom/test-utils';

import { useAccessReview, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { renderHook } from '@testing-library/react-hooks';

import useNodes from './useNodes';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useAccessReview: jest.fn(),
  useK8sWatchResource: jest.fn(),
}));

describe('useNodes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('does not open a Node watch while the access review is loading', () => {
    (useAccessReview as jest.Mock).mockReturnValue([false, true]);
    (useK8sWatchResource as jest.Mock).mockReturnValue([[], false, null]);

    const { result } = renderHook(() => useNodes());

    expect(useK8sWatchResource).toHaveBeenCalledWith(false);
    expect(result.current).toEqual([[], false, null]);
  });

  it('never opens a Node watch when the user cannot watch nodes', () => {
    (useAccessReview as jest.Mock).mockReturnValue([false, false]);
    (useK8sWatchResource as jest.Mock).mockReturnValue([[], false, null]);

    const { result } = renderHook(() => useNodes());

    expect(useK8sWatchResource).toHaveBeenCalledWith(false);
    expect(result.current).toEqual([[], false, expect.any(Error)]);
  });

  it('opens the Node watch when the user can watch nodes', () => {
    const nodes = [{ metadata: { name: 'node-1' } }];
    (useAccessReview as jest.Mock).mockReturnValue([true, false]);
    (useK8sWatchResource as jest.Mock).mockReturnValue([nodes, true, null]);

    const { result } = renderHook(() => useNodes());

    expect(useK8sWatchResource).toHaveBeenCalledWith(expect.objectContaining({ isList: true }));
    expect(result.current).toEqual([nodes, true, null]);
  });

  it('opens the Node watch as soon as the access review resolves to authorized', () => {
    const nodes = [{ metadata: { name: 'node-1' } }];
    (useAccessReview as jest.Mock).mockReturnValue([false, true]);
    (useK8sWatchResource as jest.Mock).mockReturnValue([[], false, null]);

    const { rerender, result } = renderHook(() => useNodes());

    expect(result.current).toEqual([[], false, null]);

    act(() => {
      (useAccessReview as jest.Mock).mockReturnValue([true, false]);
      (useK8sWatchResource as jest.Mock).mockReturnValue([nodes, true, null]);
      rerender();
    });

    expect(useK8sWatchResource).toHaveBeenLastCalledWith(expect.objectContaining({ isList: true }));
    expect(result.current).toEqual([nodes, true, null]);
  });
});
