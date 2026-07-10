import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isRunning } from '@virtualmachines/utils';

import {
  createDetachDiskCancelCleanup,
  createEjectMountedDiskCancelCleanup,
  mountISOToCDROM,
} from './helpers';
import { submitCDROM } from './submitCDROM';
import { V1DiskFormState } from './types';
import { runVmCdromBackgroundUpload } from './vmCdromBackgroundUpload';

jest.mock('@virtualmachines/utils', () => ({
  isRunning: jest.fn(),
}));

jest.mock('./helpers', () => ({
  createDetachDiskCancelCleanup: jest.fn(() => 'detach-cleanup'),
  createEjectMountedDiskCancelCleanup: jest.fn(() => 'eject-cleanup'),
  createMutableUploadData: jest.fn((data) => data),
  mountISOToCDROM: jest.fn(async (vm) => vm),
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

describe('submitCDROM - cancel cleanup wiring', () => {
  const onSubmit = jest.fn(async (vm: V1VirtualMachine) => vm);
  const uploadData = jest.fn();
  const t = ((key: string) => key) as any;

  beforeEach(() => {
    jest.clearAllMocks();
    onSubmit.mockImplementation(async (vm: V1VirtualMachine) => vm);
    (isRunning as jest.Mock).mockReturnValue(false);
  });

  it('builds an eject cancel cleanup (hotpluggable) forwarding getCurrentVM and onSubmit', async () => {
    const getCurrentVM = jest.fn().mockReturnValue(baseVM);

    await submitCDROM(buildData(), {
      getCurrentVM,
      isHotPluggable: true,
      onSubmit,
      t,
      uploadData,
      uploadEnabled: true,
      vm: baseVM,
    } as any);

    expect(createEjectMountedDiskCancelCleanup).toHaveBeenCalledWith(
      baseVM,
      'cdrom-1',
      getCurrentVM,
      onSubmit,
    );
    expect(createDetachDiskCancelCleanup).not.toHaveBeenCalled();
  });

  it('builds a detach cancel cleanup (non-hotpluggable) forwarding getCurrentVM and onSubmit', async () => {
    const getCurrentVM = jest.fn().mockReturnValue(baseVM);

    await submitCDROM(buildData(), {
      getCurrentVM,
      isHotPluggable: false,
      onSubmit,
      t,
      uploadData,
      uploadEnabled: true,
      vm: baseVM,
    } as any);

    expect(createDetachDiskCancelCleanup).toHaveBeenCalledWith(
      baseVM,
      'cdrom-1',
      getCurrentVM,
      onSubmit,
    );
    expect(createEjectMountedDiskCancelCleanup).not.toHaveBeenCalled();
  });

  it('falls back to the k8s-fetch-based cleanup when getCurrentVM is not provided', async () => {
    await submitCDROM(buildData(), {
      isHotPluggable: true,
      onSubmit,
      t,
      uploadData,
      uploadEnabled: true,
      vm: baseVM,
    } as any);

    expect(createEjectMountedDiskCancelCleanup).toHaveBeenCalledWith(
      baseVM,
      'cdrom-1',
      undefined,
      onSubmit,
    );
  });

  it('mounts the ISO against the live signal VM (not the stale closure) once the upload completes', async () => {
    (isRunning as jest.Mock).mockReturnValue(true);
    const liveVM: V1VirtualMachine = {
      ...baseVM,
      metadata: { ...baseVM.metadata, name: 'live-vm' },
    };
    const getCurrentVM = jest.fn().mockReturnValue(liveVM);

    await submitCDROM(buildData(), {
      getCurrentVM,
      isHotPluggable: true,
      onSubmit,
      t,
      uploadData,
      uploadEnabled: true,
      vm: baseVM,
    } as any);

    const backgroundUploadArgs = (runVmCdromBackgroundUpload as jest.Mock).mock.calls[0][0];
    await backgroundUploadArgs.afterUpload();

    expect(mountISOToCDROM).toHaveBeenCalledWith(liveVM, expect.anything(), true);
  });

  it('falls back to the closed-over VM for mounting when getCurrentVM is not provided', async () => {
    (isRunning as jest.Mock).mockReturnValue(true);

    await submitCDROM(buildData(), {
      isHotPluggable: true,
      onSubmit,
      t,
      uploadData,
      uploadEnabled: true,
      vm: baseVM,
    } as any);

    const backgroundUploadArgs = (runVmCdromBackgroundUpload as jest.Mock).mock.calls[0][0];
    await backgroundUploadArgs.afterUpload();

    expect(mountISOToCDROM).toHaveBeenCalledWith(baseVM, expect.anything(), true);
  });
});
