import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { isRunning } from '@virtualmachines/utils';

import { submit } from './submit';
import { V1DiskFormState } from './types';

jest.mock('@multicluster/k8sRequests', () => ({
  kubevirtK8sPatch: jest.fn(),
}));

jest.mock('@virtualmachines/utils', () => ({
  isRunning: jest.fn(),
}));

jest.mock('@kubevirt-utils/extensions/telemetry/vm-storage', () => ({
  logVMDiskAttached: jest.fn(),
  logVMDiskHotplug: jest.fn(),
}));

const mockKubevirtK8sPatch = kubevirtK8sPatch as jest.Mock;
const mockIsRunning = isRunning as jest.Mock;

const vm: V1VirtualMachine = {
  metadata: { name: 'test-vm', namespace: 'test-ns' },
  spec: {
    dataVolumeTemplates: [
      {
        metadata: { name: 'dv-rootdisk' },
        spec: { storage: { resources: { requests: { storage: '1Gi' } } } },
      },
    ],
    template: {
      spec: {
        domain: { devices: { disks: [{ disk: {}, name: 'rootdisk' }] } },
        volumes: [{ dataVolume: { name: 'dv-rootdisk' }, name: 'rootdisk' }],
      },
    },
  },
};

const editData: V1DiskFormState = {
  dataVolumeTemplate: {
    metadata: { name: 'dv-rootdisk' },
    spec: { storage: { resources: { requests: { storage: '1Gi' } } } },
  },
  disk: { disk: {}, name: 'rootdisk' },
  expandPVCSize: '2Gi',
  isBootSource: true,
  volume: { dataVolume: { name: 'dv-rootdisk' }, name: 'rootdisk' },
};

const pvc = { metadata: { name: 'dv-rootdisk', namespace: 'test-ns' } };

describe('submit - PVC expand errors', () => {
  const onSubmit = jest.fn().mockResolvedValue(vm);

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsRunning.mockReturnValue(false);
    onSubmit.mockResolvedValue(vm);
  });

  it('should rethrow PVC patch errors and skip the VM update', async () => {
    mockKubevirtK8sPatch.mockRejectedValue(new Error('expand failed'));

    await expect(
      submit({ data: editData, editDiskName: 'rootdisk', onSubmit, pvc, vm }),
    ).rejects.toThrow('expand failed');

    expect(mockKubevirtK8sPatch).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should update the VM after a successful PVC patch', async () => {
    mockKubevirtK8sPatch.mockResolvedValue(pvc);

    await submit({ data: editData, editDiskName: 'rootdisk', onSubmit, pvc, vm });

    expect(mockKubevirtK8sPatch).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
