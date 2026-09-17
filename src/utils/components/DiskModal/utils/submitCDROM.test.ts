import type { TFunction } from 'i18next';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isRunning } from '@virtualmachines/utils';

import { createDetachDiskCancelCleanup, createEjectMountedDiskCancelCleanup } from './helpers';
import { addDisk } from './submit';
import { submitCDROM } from './submitCDROM';
import type { V1DiskFormState } from './types';
import { runVmCdromBackgroundUpload } from './vmCdromBackgroundUpload';

jest.mock('@virtualmachines/utils', () => ({
  isRunning: jest.fn(),
}));

jest.mock('./helpers', () => ({
  createDetachDiskCancelCleanup: jest.fn(() => 'detach-cleanup'),
  createEjectMountedDiskCancelCleanup: jest.fn(() => 'eject-cleanup'),
  createMutableUploadData: jest.fn((data) => data),
}));

jest.mock('./submit', () => ({
  addDisk: jest.fn((_data, vm) => vm),
}));

jest.mock('./bootDiskUtils', () => ({
  reorderBootDisk: jest.fn((vm) => vm),
}));

jest.mock('./vmCdromBackgroundUpload', () => ({
  logBackgroundUploadError: jest.fn(),
  runVmCdromBackgroundUpload: jest.fn().mockResolvedValue(undefined),
}));

const baseVM: V1VirtualMachine = {
  metadata: { name: 'test-vm', namespace: 'test-ns' },
  spec: { running: false, template: { spec: { domain: { devices: {} } } } },
};

const buildData = (overrides: Partial<V1DiskFormState> = {}): V1DiskFormState => ({
  disk: { cdrom: {}, name: 'cdrom-1' },
  isBootSource: false,
  uploadFile: { file: new File(['iso'], 'test.iso'), filename: 'test.iso' },
  ...overrides,
});

const getAddedDiskState = (): V1DiskFormState => (addDisk as jest.Mock).mock.calls[0][0];

describe('submitCDROM - upload volume wiring', () => {
  const onSubmit = jest.fn(async (vm: V1VirtualMachine) => vm);
  const onUploadStarted = jest.fn();
  const uploadData = jest.fn();
  const t = ((key: string) => key) as TFunction;
  const baseParams = {
    onSubmit,
    selectedISO: '',
    t,
    uploadData,
    uploadEnabled: true,
    vm: baseVM,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    onSubmit.mockImplementation(async (vm: V1VirtualMachine) => vm);
    (isRunning as jest.Mock).mockReturnValue(false);
  });

  it('builds an eject cancel cleanup (hotpluggable)', async () => {
    await submitCDROM(buildData(), {
      ...baseParams,
      isHotPluggable: true,
    });

    expect(createEjectMountedDiskCancelCleanup).toHaveBeenCalledWith(baseVM, 'cdrom-1');
    expect(createDetachDiskCancelCleanup).not.toHaveBeenCalled();
  });

  it('builds a detach cancel cleanup (non-hotpluggable)', async () => {
    await submitCDROM(buildData(), {
      ...baseParams,
      isHotPluggable: false,
    });

    expect(createDetachDiskCancelCleanup).toHaveBeenCalledWith(baseVM, 'cdrom-1');
    expect(createEjectMountedDiskCancelCleanup).not.toHaveBeenCalled();
  });

  it('attaches a dataVolume source before upload on a running hot-pluggable VM', async () => {
    (isRunning as jest.Mock).mockReturnValue(true);

    await submitCDROM(buildData(), {
      ...baseParams,
      isHotPluggable: true,
      onUploadStarted,
    });

    const added = getAddedDiskState();
    expect(added.dataVolumeTemplate).toBeUndefined();
    expect(added.volume?.dataVolume).toEqual({
      hotpluggable: true,
      name: expect.stringMatching(/^cdrom-1-upload-/),
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(runVmCdromBackgroundUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        dvName: added.volume?.dataVolume?.name,
        vm: baseVM,
      }),
    );
    expect(onUploadStarted).toHaveBeenCalledTimes(1);
  });

  it('attaches a PVC claim before upload on a stopped VM', async () => {
    await submitCDROM(buildData(), {
      ...baseParams,
      isHotPluggable: true,
    });

    const added = getAddedDiskState();
    expect(added.dataVolumeTemplate).toBeUndefined();
    expect(added.volume?.persistentVolumeClaim).toEqual({
      claimName: expect.stringMatching(/^cdrom-1-upload-/),
      hotpluggable: true,
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(runVmCdromBackgroundUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        dvName: added.volume?.persistentVolumeClaim?.claimName,
      }),
    );
  });

  it('does not start the upload when attaching the DataVolume fails', async () => {
    (isRunning as jest.Mock).mockReturnValue(true);
    onSubmit.mockRejectedValueOnce(new Error('patch failed'));

    await expect(
      submitCDROM(buildData(), {
        ...baseParams,
        isHotPluggable: true,
      }),
    ).rejects.toThrow('patch failed');

    expect(runVmCdromBackgroundUpload).not.toHaveBeenCalled();
  });

  it('does not start an upload when mounting an existing ISO', async () => {
    await submitCDROM(buildData({ volume: { name: 'cdrom-1' } }), {
      ...baseParams,
      isHotPluggable: true,
      selectedISO: 'existing-iso',
    });

    expect(runVmCdromBackgroundUpload).not.toHaveBeenCalled();
    expect(getAddedDiskState().volume?.persistentVolumeClaim?.claimName).toBe('existing-iso');
  });

  it('does not start an upload when adding an empty drive', async () => {
    await submitCDROM(buildData({ uploadFile: undefined }), {
      ...baseParams,
      isHotPluggable: true,
      uploadEnabled: false,
    });

    expect(runVmCdromBackgroundUpload).not.toHaveBeenCalled();
    expect(getAddedDiskState().volume).toBeUndefined();
  });
});
