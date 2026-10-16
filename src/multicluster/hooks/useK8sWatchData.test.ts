import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { renderHook } from '@testing-library/react-hooks';

import useK8sWatchData from './useK8sWatchData';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => {
  const actual = jest.requireActual('@openshift-console/dynamic-plugin-sdk');
  return {
    ...actual,
    useK8sWatchResource: jest.fn(),
  };
});

const vmis = [
  { metadata: { name: 'b-vm', namespace: 'ns-b' } },
  { metadata: { name: 'a-vm', namespace: 'ns-a' } },
];

const kindOnly = {
  isList: true,
  kind: 'kubevirt.io~v1~VirtualMachineInstance',
  namespace: 'ns-a',
};

const withGVK = {
  groupVersionKind: {
    group: 'kubevirt.io',
    kind: 'VirtualMachineInstance',
    version: 'v1',
  },
  isList: true,
  namespace: 'ns-a',
};

describe('useK8sWatchData', () => {
  beforeEach(() => {
    (useK8sWatchResource as jest.Mock).mockReturnValue([vmis, true, undefined]);
  });

  it('returns undefined for a kind-only list, even when the SDK has items', () => {
    const { result } = renderHook(() => useK8sWatchData(kindOnly as never));

    expect(useK8sWatchResource).toHaveBeenCalled();
    expect(result.current[0]).toBeUndefined();
    expect(result.current[1]).toBe(true);
    expect(() => (result.current[0] as { sort?: () => void }).sort()).toThrow(TypeError);
  });

  it('returns the watched instances when groupVersionKind is set', () => {
    const { result } = renderHook(() => useK8sWatchData(withGVK));

    expect(result.current[0]).toEqual(vmis);
    expect(() => (result.current[0] as { metadata: { name: string } }[]).sort()).not.toThrow();
  });

  it('returns [] when a groupVersionKind list is empty or the SDK data is null', () => {
    (useK8sWatchResource as jest.Mock).mockReturnValue([[], true, undefined]);
    const empty = renderHook(() => useK8sWatchData(withGVK));
    expect(empty.result.current[0]).toEqual([]);
    expect(() => (empty.result.current[0] as unknown[]).sort()).not.toThrow();

    (useK8sWatchResource as jest.Mock).mockReturnValue([null, true, undefined]);
    const missing = renderHook(() => useK8sWatchData(withGVK));
    expect(missing.result.current[0]).toEqual([]);
  });
});
