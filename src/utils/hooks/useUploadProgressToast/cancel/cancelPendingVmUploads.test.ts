import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { customizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';

import { useUploadProgressStore } from '../uploadProgressStore';

import { cancelAllWizardPendingUploads, cancelPendingVmUploads } from './cancelPendingVmUploads';

jest.mock('../uploadProgressStore', () => ({
  useUploadProgressStore: {
    getState: jest.fn(),
  },
}));

const CLUSTER = 'local-cluster';
const NAMESPACE = 'default';
const VM_NAME = 'test-vm';

const createVm = (): V1VirtualMachine => ({
  cluster: CLUSTER,
  metadata: { name: VM_NAME, namespace: NAMESPACE },
  spec: { template: {} },
});

describe('cancelPendingVmUploads', () => {
  const cancelUploadsForVm = jest.fn().mockResolvedValue(undefined);
  const cancelAllPendingUploads = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    customizeWizardVMSignal.value = null;
    (useUploadProgressStore.getState as jest.Mock).mockReturnValue({
      cancelAllPendingUploads,
      cancelUploadsForVm,
    });
  });

  it('should call cancelUploadsForVm with the provided VM', async () => {
    const vm = createVm();

    await cancelPendingVmUploads(vm);

    expect(cancelUploadsForVm).toHaveBeenCalledWith(CLUSTER, NAMESPACE, VM_NAME);
  });

  it('should read vmSignal when no VM is provided', async () => {
    customizeWizardVMSignal.value = createVm();

    await cancelPendingVmUploads();

    expect(cancelUploadsForVm).toHaveBeenCalledWith(CLUSTER, NAMESPACE, VM_NAME);
  });

  it('should no-op when vmSignal is null and no VM is provided', async () => {
    await cancelPendingVmUploads();

    expect(cancelUploadsForVm).not.toHaveBeenCalled();
  });

  it('should no-op when VM identity is incomplete', async () => {
    await cancelPendingVmUploads({
      metadata: { name: VM_NAME },
      spec: { template: {} },
    });

    expect(cancelUploadsForVm).not.toHaveBeenCalled();
  });

  it('should call cancelUploadsForVm with empty cluster when VM has no cluster', async () => {
    await cancelPendingVmUploads({
      metadata: { name: VM_NAME, namespace: NAMESPACE },
      spec: { template: {} },
    });

    expect(cancelUploadsForVm).toHaveBeenCalledWith('', NAMESPACE, VM_NAME);
  });
});

describe('cancelAllWizardPendingUploads', () => {
  const cancelAllPendingUploads = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUploadProgressStore.getState as jest.Mock).mockReturnValue({ cancelAllPendingUploads });
  });

  it('should cancel all pending uploads in the store', () => {
    cancelAllWizardPendingUploads();

    expect(cancelAllPendingUploads).toHaveBeenCalledTimes(1);
  });
});
