import { type TFunction } from 'i18next';

import { CLONE_VM_CANNOT_RETRIEVE_STATUS_CONTENT } from '@kubevirt-utils/components/CloneVMModal/utils/constants';
import { AlertVariant } from '@patternfly/react-core';

import { type WatchedResourceToast } from '../types/types';
import { getToastOptionsByResourceStatus } from './watchedResourceToastOptions';

const navigate = jest.fn();
const t = jest.fn((key: string) => key) as unknown as TFunction;

describe('getToastOptionsByResourceStatus', () => {
  const watchedToast: WatchedResourceToast = {
    id: 'clone-vm-test',
    toastOptions: {
      content:
        'Clone completed. The cloned virtual machine may take some time to appear in the list.',
      successLinks: [{ label: 'View vm', url: '/vm' }],
      title: 'Clone virtual machine - test-vm',
    },
    watchDataResource: undefined,
  };

  it('returns danger toast when request error is set', () => {
    const options = getToastOptionsByResourceStatus({
      navigate,
      resource: undefined,
      t,
      watchedResourceToast: {
        ...watchedToast,
        toastOptions: {
          ...watchedToast.toastOptions,
          error: new Error('API create failed'),
        },
      },
      watchError: undefined,
    });

    expect(options).toMatchObject({
      content: 'API create failed',
      title: 'Clone virtual machine - test-vm',
      variant: AlertVariant.danger,
    });
  });

  it('returns undefined when watch error is set without resource data', () => {
    const options = getToastOptionsByResourceStatus({
      navigate,
      resource: undefined,
      t,
      watchedResourceToast: watchedToast,
      watchError: { code: 404 },
    });

    expect(options).toBeUndefined();
  });

  it('returns warning toast when watch error is set with in-progress resource data', () => {
    const resource = {
      apiVersion: 'clone.kubevirt.io/v1beta1',
      kind: 'VirtualMachineClone',
      metadata: { name: 'test-cr', namespace: 'default' },
      status: { phase: 'InProgress' },
    };

    const options = getToastOptionsByResourceStatus({
      navigate,
      resource,
      t,
      watchedResourceToast: watchedToast,
      watchError: { code: 404 },
    });

    expect(options?.variant).toBe(AlertVariant.warning);
    expect(options?.title).toBe(watchedToast.toastOptions.title);
    expect(t).toHaveBeenCalledWith(CLONE_VM_CANNOT_RETRIEVE_STATUS_CONTENT);
  });

  it('returns warning toast when watch error is set even if phase is Succeeded', () => {
    const resource = {
      apiVersion: 'clone.kubevirt.io/v1beta1',
      kind: 'VirtualMachineClone',
      metadata: { name: 'test-cr', namespace: 'default' },
      status: { phase: 'Succeeded' },
    };

    const options = getToastOptionsByResourceStatus({
      navigate,
      resource,
      t,
      watchedResourceToast: watchedToast,
      watchError: { code: 404 },
    });

    expect(options?.variant).toBe(AlertVariant.warning);
  });

  it('returns undefined while the resource has no terminal status', () => {
    const options = getToastOptionsByResourceStatus({
      navigate,
      resource: undefined,
      t,
      watchedResourceToast: watchedToast,
      watchError: undefined,
    });

    expect(options).toBeUndefined();
  });

  it('returns success toast when clone resource phase is Succeeded', () => {
    const resource = {
      apiVersion: 'clone.kubevirt.io/v1beta1',
      kind: 'VirtualMachineClone',
      metadata: { name: 'test-cr', namespace: 'default' },
      status: { phase: 'Succeeded' },
    };

    const options = getToastOptionsByResourceStatus({
      navigate,
      resource,
      t,
      watchedResourceToast: watchedToast,
      watchError: undefined,
    });

    expect(options?.variant).toBe(AlertVariant.success);
    expect(options?.title).toBe(watchedToast.toastOptions.title);
  });
});
