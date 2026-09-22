import type { TFunction } from 'i18next';

import { DataVolumeModel, VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';

import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { useUploadProgressStore } from '../uploadProgressStore';

import { completeVmCdromUpload, completeVmDiskUpload } from './uploadCompletion';
import { getVmStorageUrl } from './uploadLinks';

jest.mock('@multicluster/k8sRequests', () => ({
  kubevirtK8sGet: jest.fn(),
}));

jest.mock('../uploadProgressStore', () => ({
  useUploadProgressStore: {
    getState: jest.fn(),
  },
}));

const t = ((key: string, options?: { name?: string }) =>
  options?.name ? `${key}:${options.name}` : key) as TFunction;

const mockKubevirtK8sGet = kubevirtK8sGet as jest.Mock;
const completeUpload = jest.fn();
const getUpload = jest.fn();

const DISK_NAME = 'disk-0';
const DV_NAME = 'dv-disk-0';
const UPLOAD_KEY = 'vm-disk/default/test-vm/disk-0';
const GENERATION = 1;

const createVm = (overrides: V1VirtualMachine['metadata'] = {}): V1VirtualMachine => ({
  metadata: {
    name: 'test-vm',
    namespace: 'default',
    uid: 'vm-uid',
    ...overrides,
  },
  spec: { template: {} },
});

describe('completeVmDiskUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getUpload.mockReturnValue({
      generation: GENERATION,
      status: UPLOAD_PROGRESS_STATUS.UPLOADING,
    });
    (useUploadProgressStore.getState as jest.Mock).mockReturnValue({
      completeUpload,
      getUpload,
    });
  });

  it('should include the VM storage link when the VM still exists', async () => {
    const vm = createVm();
    mockKubevirtK8sGet.mockImplementation(({ model }) => {
      if (model === VirtualMachineModel) {
        return Promise.resolve(vm);
      }
      return Promise.resolve({ metadata: { name: DV_NAME } });
    });

    await completeVmDiskUpload({
      dataVolumeName: DV_NAME,
      diskName: DISK_NAME,
      expectedGeneration: GENERATION,
      t,
      uploadKey: UPLOAD_KEY,
      vm,
    });

    expect(completeUpload).toHaveBeenCalledWith(
      UPLOAD_KEY,
      expect.objectContaining({
        expectedGeneration: GENERATION,
        successLinks: expect.arrayContaining([
          expect.objectContaining({ label: 'View disk {{name}}:disk-0', url: getVmStorageUrl(vm) }),
        ]),
      }),
    );
  });

  it('should omit the VM storage link when the VM has been deleted', async () => {
    const vm = createVm();
    mockKubevirtK8sGet.mockImplementation(({ model }) => {
      if (model === VirtualMachineModel) {
        return Promise.reject({ code: 404 });
      }
      return Promise.resolve({ metadata: { name: DV_NAME } });
    });

    await completeVmDiskUpload({
      dataVolumeName: DV_NAME,
      diskName: DISK_NAME,
      expectedGeneration: GENERATION,
      t,
      uploadKey: UPLOAD_KEY,
      vm,
    });

    const successLinks = completeUpload.mock.calls[0][1].successLinks as { label: string }[];
    expect(successLinks).toHaveLength(1);
    expect(successLinks[0].label).toBe('View DataVolume {{name}}:dv-disk-0');
  });

  it('should omit the DataVolume link when the DataVolume has a deletionTimestamp', async () => {
    const vm = createVm();
    mockKubevirtK8sGet.mockImplementation(({ model }) => {
      if (model === DataVolumeModel) {
        return Promise.resolve({
          metadata: { deletionTimestamp: '2026-09-16T12:00:00Z', name: DV_NAME },
        });
      }
      return Promise.resolve(vm);
    });

    await completeVmDiskUpload({
      dataVolumeName: DV_NAME,
      diskName: DISK_NAME,
      expectedGeneration: GENERATION,
      t,
      uploadKey: UPLOAD_KEY,
      vm,
    });

    const successLinks = completeUpload.mock.calls[0][1].successLinks as { label: string }[];
    expect(successLinks).toEqual([
      expect.objectContaining({ label: 'View disk {{name}}:disk-0', url: getVmStorageUrl(vm) }),
    ]);
  });

  it('should omit the DataVolume link when the DataVolume has been deleted', async () => {
    const vm = createVm();
    mockKubevirtK8sGet.mockImplementation(({ model }) => {
      if (model === DataVolumeModel) {
        return Promise.reject({ code: 404 });
      }
      return Promise.resolve(vm);
    });

    await completeVmDiskUpload({
      dataVolumeName: DV_NAME,
      diskName: DISK_NAME,
      expectedGeneration: GENERATION,
      t,
      uploadKey: UPLOAD_KEY,
      vm,
    });

    const successLinks = completeUpload.mock.calls[0][1].successLinks as { label: string }[];
    expect(successLinks).toEqual([
      expect.objectContaining({ label: 'View disk {{name}}:disk-0', url: getVmStorageUrl(vm) }),
    ]);
  });

  it('should omit the VM storage link when the fetched VM has a different UID', async () => {
    const vm = createVm();
    mockKubevirtK8sGet.mockImplementation(({ model }) => {
      if (model === VirtualMachineModel) {
        return Promise.resolve(createVm({ uid: 'other-vm-uid' }));
      }
      return Promise.resolve({ metadata: { name: DV_NAME } });
    });

    await completeVmDiskUpload({
      dataVolumeName: DV_NAME,
      diskName: DISK_NAME,
      expectedGeneration: GENERATION,
      t,
      uploadKey: UPLOAD_KEY,
      vm,
    });

    const successLinks = completeUpload.mock.calls[0][1].successLinks as { label: string }[];
    expect(successLinks).toHaveLength(1);
    expect(successLinks[0].label).toBe('View DataVolume {{name}}:dv-disk-0');
  });

  it('should not complete when the upload is no longer uploading', async () => {
    getUpload.mockReturnValue({
      generation: GENERATION,
      status: UPLOAD_PROGRESS_STATUS.CANCELED,
    });

    await completeVmDiskUpload({
      dataVolumeName: DV_NAME,
      diskName: DISK_NAME,
      expectedGeneration: GENERATION,
      t,
      uploadKey: UPLOAD_KEY,
      vm: createVm(),
    });

    expect(mockKubevirtK8sGet).not.toHaveBeenCalled();
    expect(completeUpload).not.toHaveBeenCalled();
  });

  it('should not complete when the upload was replaced with a newer generation', async () => {
    getUpload.mockReturnValue({
      generation: 2,
      status: UPLOAD_PROGRESS_STATUS.UPLOADING,
    });

    await completeVmDiskUpload({
      dataVolumeName: DV_NAME,
      diskName: DISK_NAME,
      expectedGeneration: GENERATION,
      t,
      uploadKey: UPLOAD_KEY,
      vm: createVm(),
    });

    expect(mockKubevirtK8sGet).not.toHaveBeenCalled();
    expect(completeUpload).not.toHaveBeenCalled();
  });
});

describe('completeVmCdromUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getUpload.mockReturnValue({
      generation: GENERATION,
      status: UPLOAD_PROGRESS_STATUS.UPLOADING,
    });
    (useUploadProgressStore.getState as jest.Mock).mockReturnValue({
      completeUpload,
      getUpload,
    });
  });

  it('should omit storage links when the VM has been deleted', async () => {
    mockKubevirtK8sGet.mockRejectedValue({ code: 404 });

    await completeVmCdromUpload({
      dataVolumeName: DV_NAME,
      diskName: DISK_NAME,
      expectedGeneration: GENERATION,
      t,
      uploadKey: UPLOAD_KEY,
      vm: createVm(),
    });

    expect(completeUpload).toHaveBeenCalledWith(
      UPLOAD_KEY,
      expect.objectContaining({ expectedGeneration: GENERATION, successLinks: [] }),
    );
  });
});
