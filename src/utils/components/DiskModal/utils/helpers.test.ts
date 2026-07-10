import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { updateDisks } from '@virtualmachines/details/tabs/configuration/details/utils/utils';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';

import {
  createDataVolumeName,
  createDetachDiskCancelCleanup,
  createEjectMountedDiskCancelCleanup,
} from './helpers';

jest.mock('@multicluster/k8sRequests', () => ({
  kubevirtK8sGet: jest.fn(),
}));

jest.mock('@virtualmachines/details/tabs/configuration/details/utils/utils', () => ({
  updateDisks: jest.fn(),
}));

const vm = (name: string): V1VirtualMachine => ({ metadata: { name }, spec: { template: {} } });
const RANDOM_CHARS = /[a-z0-9]/;

describe('Generate names for data volume', () => {
  test('simple name', () => {
    const name = createDataVolumeName(vm('foo'), 'bar');
    expect(name).toHaveLength(17);
    expect(name.substring(0, 11)).toEqual('dv-foo-bar-');
    expect(name.substring(11, 18)).toMatch(RANDOM_CHARS);
  });
  it('truncates too long names and remove trailing hyphen', () => {
    const name52CharsLong = '52charlong52charlong52charlong52charlong52charlong52';
    const name = createDataVolumeName(vm(name52CharsLong), 'bar');
    expect(name).toHaveLength(62);
    expect(name.substring(0, 56)).toEqual(`dv-${name52CharsLong}-`);
  });

  it('skips invalid disk and vm name', () => {
    const name = createDataVolumeName(vm('Foo'), '*bar*');
    expect(name).toHaveLength(9);
    expect(name.substring(0, 3)).toEqual('dv-');
    expect(name.substring(3, 9)).toMatch(RANDOM_CHARS);
  });
});

describe('createEjectMountedDiskCancelCleanup / createDetachDiskCancelCleanup', () => {
  const cdromName = 'cdrom-1';

  const vmWithCdrom = (): V1VirtualMachine => ({
    metadata: { name: 'test-vm', namespace: 'test-ns' },
    spec: {
      template: {
        spec: {
          domain: { devices: { disks: [{ cdrom: {}, name: cdromName }] } },
          volumes: [{ dataVolume: { name: 'dv-1' }, name: cdromName }],
        },
      },
    },
  });

  const mockKubevirtK8sGet = kubevirtK8sGet as jest.Mock;
  const mockUpdateDisks = updateDisks as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('without getCurrentVM (persisted VM / details page)', () => {
    it('re-fetches the VM from the cluster and patches it', async () => {
      const freshVM = vmWithCdrom();
      mockKubevirtK8sGet.mockResolvedValue(freshVM);

      const cleanup = createEjectMountedDiskCancelCleanup(vmWithCdrom(), cdromName);
      await cleanup();

      expect(mockKubevirtK8sGet).toHaveBeenCalledTimes(1);
      expect(mockUpdateDisks).toHaveBeenCalledTimes(1);
      const patchedVM = mockUpdateDisks.mock.calls[0][0] as V1VirtualMachine;
      expect(patchedVM.spec.template.spec.volumes).toEqual([]);
    });
  });

  describe('with getCurrentVM (in-memory wizard VM)', () => {
    it('transforms the live VM from getCurrentVM and submits it via onSubmit', async () => {
      const currentVM = vmWithCdrom();
      const getCurrentVM = jest.fn().mockReturnValue(currentVM);
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      const cleanup = createEjectMountedDiskCancelCleanup(
        vmWithCdrom(),
        cdromName,
        getCurrentVM,
        onSubmit,
      );
      await cleanup();

      expect(mockKubevirtK8sGet).not.toHaveBeenCalled();
      expect(getCurrentVM).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledTimes(1);
      const submittedVM = onSubmit.mock.calls[0][0] as V1VirtualMachine;
      expect(submittedVM.spec.template.spec.volumes).toEqual([]);
    });

    it('detaches (rather than ejects) the disk when using createDetachDiskCancelCleanup', async () => {
      const currentVM = vmWithCdrom();
      const getCurrentVM = jest.fn().mockReturnValue(currentVM);
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      const cleanup = createDetachDiskCancelCleanup(
        vmWithCdrom(),
        cdromName,
        getCurrentVM,
        onSubmit,
      );
      await cleanup();

      const submittedVM = onSubmit.mock.calls[0][0] as V1VirtualMachine;
      expect(submittedVM.spec.template.spec.domain.devices.disks).toEqual([]);
      expect(submittedVM.spec.template.spec.volumes).toEqual([]);
    });

    it('skips cleanup without calling onSubmit when getCurrentVM returns null', async () => {
      const getCurrentVM = jest.fn().mockReturnValue(null);
      const onSubmit = jest.fn();

      const cleanup = createEjectMountedDiskCancelCleanup(
        vmWithCdrom(),
        cdromName,
        getCurrentVM,
        onSubmit,
      );
      await expect(cleanup()).resolves.toBeUndefined();

      expect(onSubmit).not.toHaveBeenCalled();
      expect(mockKubevirtK8sGet).not.toHaveBeenCalled();
    });
  });
});
