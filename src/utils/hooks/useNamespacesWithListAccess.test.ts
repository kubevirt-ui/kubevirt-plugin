import { checkAccess } from '@openshift-console/dynamic-plugin-sdk';
import { renderHook, waitFor } from '@testing-library/react';

import useNamespacesWithListAccess from './useNamespacesWithListAccess';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  checkAccess: jest.fn(),
}));

const mockedCheckAccess = checkAccess as jest.Mock;
const VM_ATTRS = { group: 'kubevirt.io', resource: 'virtualmachines' };

const ssar = (allowed: boolean) => Promise.resolve({ status: { allowed } });

describe('useNamespacesWithListAccess', () => {
  beforeEach(() => jest.resetAllMocks());

  it('does not review and does not block loading when disabled', () => {
    const { result } = renderHook(() =>
      useNamespacesWithListAccess(VM_ATTRS, ['default', 'webapp-vms'], false),
    );

    expect(result.current).toEqual([[], true]);
    expect(mockedCheckAccess).not.toHaveBeenCalled();
  });

  it('keeps only namespaces where list is allowed (CNV-101272 mixed RBAC)', async () => {
    mockedCheckAccess.mockImplementation(({ namespace }) => ssar(namespace === 'webapp-vms'));

    const { result } = renderHook(() =>
      useNamespacesWithListAccess(VM_ATTRS, ['default', 'openshift-cnv', 'webapp-vms'], true),
    );

    expect(result.current).toEqual([[], false]);
    await waitFor(() => expect(result.current).toEqual([['webapp-vms'], true]));
    expect(mockedCheckAccess).toHaveBeenCalledWith({
      group: 'kubevirt.io',
      namespace: 'default',
      resource: 'virtualmachines',
      verb: 'list',
    });
  });

  it('fails open for namespaces whose access review request errors', async () => {
    mockedCheckAccess.mockImplementation(({ namespace }) =>
      namespace === 'flaky' ? Promise.reject(new Error('boom')) : ssar(false),
    );

    const { result } = renderHook(() =>
      useNamespacesWithListAccess(VM_ATTRS, ['flaky', 'denied'], true),
    );

    await waitFor(() => expect(result.current).toEqual([['flaky'], true]));
  });

  it('resolves to an empty, loaded list when no namespace is allowed', async () => {
    mockedCheckAccess.mockImplementation(() => ssar(false));

    const { result } = renderHook(() => useNamespacesWithListAccess(VM_ATTRS, ['a', 'b'], true));

    await waitFor(() => expect(result.current).toEqual([[], true]));
  });

  it('does not re-run reviews when the same namespaces are passed as a new array', async () => {
    mockedCheckAccess.mockImplementation(() => ssar(true));

    const { rerender, result } = renderHook(
      ({ namespaces }) => useNamespacesWithListAccess(VM_ATTRS, namespaces, true),
      { initialProps: { namespaces: ['a', 'b'] } },
    );
    await waitFor(() => expect(result.current[1]).toBe(true));

    rerender({ namespaces: ['a', 'b'] });

    expect(result.current).toEqual([['a', 'b'], true]);
    expect(mockedCheckAccess).toHaveBeenCalledTimes(2);
  });
});
