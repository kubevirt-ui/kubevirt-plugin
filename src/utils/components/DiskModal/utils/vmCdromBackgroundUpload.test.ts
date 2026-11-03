import type { TFunction } from 'i18next';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { UploadCanceledError } from '@kubevirt-utils/hooks/useCDIUpload/errors';
import { completeVmCdromUpload } from '@kubevirt-utils/hooks/useInFlightToast/completion/uploadCompletion';
import { UPLOAD_PROGRESS_STATUS } from '@kubevirt-utils/hooks/useInFlightToast/constants';
import {
  resetInFlightToastStore,
  useInFlightToastStore,
} from '@kubevirt-utils/hooks/useInFlightToast/inFlightToastStore';

import { uploadDataVolume } from './submit';
import type { V1DiskFormState } from './types';
import { runVmCdromBackgroundUpload } from './vmCdromBackgroundUpload';

jest.mock('./submit', () => ({
  uploadDataVolume: jest.fn(),
}));

jest.mock('@kubevirt-utils/hooks/useInFlightToast/completion/uploadCompletion', () => ({
  completeVmCdromUpload: jest.fn().mockResolvedValue(undefined),
}));

const mockUploadDataVolume = uploadDataVolume as jest.MockedFunction<typeof uploadDataVolume>;
const mockCompleteVmCdromUpload = completeVmCdromUpload as jest.MockedFunction<
  typeof completeVmCdromUpload
>;

const UPLOAD_KEY = 'vm-cdrom/local-cluster/default/test-vm/cdrom-1';
const t = ((key: string) => key) as TFunction;

const vm: V1VirtualMachine = {
  metadata: { name: 'test-vm', namespace: 'default' },
  spec: { template: {} },
};

const diskState = {
  disk: { cdrom: {}, name: 'cdrom-1' },
  isBootSource: false,
  volume: { name: 'cdrom-1' },
} as V1DiskFormState;

const runUpload = (
  overrides: Partial<Parameters<typeof runVmCdromBackgroundUpload>[0]> = {},
): ReturnType<typeof runVmCdromBackgroundUpload> =>
  runVmCdromBackgroundUpload({
    diskState,
    dvName: 'dv-cdrom-1',
    isHotPluggable: false,
    onCancelCleanup: jest.fn(),
    t,
    uploadData: jest.fn(),
    uploadKey: UPLOAD_KEY,
    vm,
    ...overrides,
  });

describe('runVmCdromBackgroundUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetInFlightToastStore();
  });

  it('should not fail a newer same-key upload when uploadDataVolume rejects before returning generation', async () => {
    useInFlightToastStore
      .getState()
      .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: 'test.iso' });
    useInFlightToastStore
      .getState()
      .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: 'retry.iso' });
    mockUploadDataVolume.mockRejectedValue(new Error('proxy failed'));

    await expect(runUpload()).rejects.toThrow('proxy failed');

    const upload = useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY);
    expect(upload?.generation).toBe(2);
    expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
    expect(upload?.errorMessage).toBeUndefined();
  });

  it('should fail the captured generation when completeVmCdromUpload rejects', async () => {
    useInFlightToastStore
      .getState()
      .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: 'test.iso' });
    mockUploadDataVolume.mockResolvedValue({
      dataVolume: {
        metadata: { name: 'dv-cdrom-1' },
        spec: {},
      },
      expectedGeneration: 1,
    });
    mockCompleteVmCdromUpload.mockRejectedValueOnce(new Error('complete failed'));

    await expect(runUpload()).rejects.toThrow('complete failed');

    const upload = useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY);
    expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.ERROR);
    expect(upload?.errorMessage).toBe('complete failed');
  });

  it('should not mark the store failed when the upload was canceled', async () => {
    useInFlightToastStore
      .getState()
      .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: 'test.iso' });
    mockUploadDataVolume.mockRejectedValue(new UploadCanceledError());

    await expect(runUpload()).resolves.toBeUndefined();

    expect(useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY)?.status).toBe(
      UPLOAD_PROGRESS_STATUS.UPLOADING,
    );
  });
});
