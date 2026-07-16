import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getCustomizeWizardVM,
  updateVMCustomizeIT,
} from '@kubevirt-utils/signals/customizeWizardVMSignal';
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

jest.mock('@kubevirt-utils/signals/customizeWizardVMSignal', () => ({
  getCustomizeWizardVM: jest.fn(),
  updateVMCustomizeIT: jest.fn(),
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
  const mockGetCustomizeWizardVM = getCustomizeWizardVM as jest.Mock;
  const mockUpdateVMCustomizeIT = updateVMCustomizeIT as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCustomizeWizardVM.mockReturnValue(null);
  });

  describe('without a wizard draft VM (persisted VM / details page)', () => {
    it('re-fetches the VM from the cluster and patches it', async () => {
      const freshVM = vmWithCdrom();
      mockKubevirtK8sGet.mockResolvedValue(freshVM);

      const cleanup = createEjectMountedDiskCancelCleanup(vmWithCdrom(), cdromName);
      await cleanup();

      expect(mockKubevirtK8sGet).toHaveBeenCalledTimes(1);
      expect(mockUpdateDisks).toHaveBeenCalledTimes(1);
      expect(mockUpdateVMCustomizeIT).not.toHaveBeenCalled();
      const patchedVM = mockUpdateDisks.mock.calls[0][0] as V1VirtualMachine;
      expect(patchedVM.spec.template.spec.volumes).toEqual([]);
    });
  });

  describe('with a wizard draft VM (in-memory customize instance type wizard)', () => {
    it('transforms the live signal VM and patches it via updateVMCustomizeIT', async () => {
      const draftVM = vmWithCdrom();
      mockGetCustomizeWizardVM.mockReturnValue(draftVM);

      const cleanup = createEjectMountedDiskCancelCleanup(vmWithCdrom(), cdromName);
      await cleanup();

      expect(mockKubevirtK8sGet).not.toHaveBeenCalled();
      expect(mockUpdateVMCustomizeIT).toHaveBeenCalledTimes(1);
      const patchedVM = mockUpdateVMCustomizeIT.mock.calls[0][0] as V1VirtualMachine;
      expect(patchedVM.spec.template.spec.volumes).toEqual([]);
    });

    it('detaches (rather than ejects) the disk when using createDetachDiskCancelCleanup', async () => {
      const draftVM = vmWithCdrom();
      mockGetCustomizeWizardVM.mockReturnValue(draftVM);

      const cleanup = createDetachDiskCancelCleanup(vmWithCdrom(), cdromName);
      await cleanup();

      const patchedVM = mockUpdateVMCustomizeIT.mock.calls[0][0] as V1VirtualMachine;
      expect(patchedVM.spec.template.spec.domain.devices.disks).toEqual([]);
      expect(patchedVM.spec.template.spec.volumes).toEqual([]);
    });
  });
});
