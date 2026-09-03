import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
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

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    customizeWizardVMSignal.value = null;
    (useUploadProgressStore.getState as jest.Mock).mockReturnValue({
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
  const cancelWizardPendingUploads = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    customizeWizardVMSignal.value = null;
    (useUploadProgressStore.getState as jest.Mock).mockReturnValue({ cancelWizardPendingUploads });
  });

  it('should cancel wizard-scoped pending uploads for the current wizard VM', () => {
    const vm = createVm();
    customizeWizardVMSignal.value = vm;

    cancelAllWizardPendingUploads();

    expect(cancelWizardPendingUploads).toHaveBeenCalledTimes(1);
    expect(cancelWizardPendingUploads).toHaveBeenCalledWith(vm, []);
  });

  it('should pass undefined when wizard VM is null', () => {
    cancelAllWizardPendingUploads();

    expect(cancelWizardPendingUploads).toHaveBeenCalledWith(undefined, []);
  });
});
