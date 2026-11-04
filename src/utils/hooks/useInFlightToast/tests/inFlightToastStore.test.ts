import { resetInFlightToastStore } from '../inFlightToastStore';

import {
  getExportDiskActions,
  getExportDiskData,
  getUploadsActions,
  getUploadsData,
} from '../shared/selectors/inFlightToastStoreSelectors';
import { type InFlightToastStoreActions, type StartUploadEntry } from '../shared/types/types';
import { describeCancelTrackedUpload } from './cancelTrackedUploadTests';
import { describeCompleteUpload, describeFailUpload } from './completionTests';
import { describeEntryOperations } from './entryOperationsTests';
import {
  describeMarkUploadCanceled,
  describeStartUpload,
  describeUpdateProgress,
} from './stateTransitionTests';
import { describeUploadsSpecific } from './uploadsSpecificTests';

jest.mock('@kubevirt-utils/hooks/useCDIUpload/utils', () => ({
  cancelUploadPVC: jest.fn(),
}));

const EXPORT_POD_NAME = 'export-pod';
const EXPORT_PVC_NAME = 'export-pvc';
const EXPORT_SECRET_NAME = 'export-secret';

export type SliceTestHelper = {
  getActions: () => Omit<InFlightToastStoreActions, 'startUpload'>;
  getData: () => Record<string, unknown>;
  startUpload: (key: string, entry: StartUploadEntry) => number | undefined;
};

export const UPLOAD_KEY = 'test-upload-key';
export const FILE_IMAGE_ISO = 'image.iso';
export const MISSING_KEY = 'missing-key';
export const ERROR_UPLOAD_FAILED = 'Upload failed';
export const DISK_NAME = 'disk-1';
export const TOAST_ID_1 = 'toast-1';
export const TOAST_ID_2 = 'toast-2';
export const ERROR_CANCEL_FAILED = 'cancel failed';
export const DV_NAME = 'upload-dv';
export const NAMESPACE = 'default';
export const CLUSTER = 'local-cluster';
export const VM_NAME = 'test-vm';
export const VM_DISK_NAME = 'rootdisk';
export const CDROM_NAME = 'cdrom-1';
export const OTHER_VM_NAME = 'other-vm';
export const BOOTABLE_VOLUME_NAMESPACE = 'openshift-virtualization-os-images';
export const BOOTABLE_VOLUME_NAME = 'fedora-40';
export const LINK_LABEL_VIEW_DISK = 'View disk';
export const LINK_URL_DISK = '/disk';
export const LINK_LABEL_EXISTING = 'Existing link';
export const LINK_URL_EXISTING = '/existing';

const uploadsHelper: SliceTestHelper = {
  getActions: () => getUploadsActions(),
  getData: () => getUploadsData(),
  startUpload: (key, entry) => getUploadsActions().startUpload(key, entry),
};

const exportDiskHelper: SliceTestHelper = {
  getActions: () => getExportDiskActions(),
  getData: () => getExportDiskData(),
  startUpload: (key, entry) =>
    getExportDiskActions().startUpload(key, {
      cluster: CLUSTER,
      entry,
      pod: { metadata: { name: EXPORT_POD_NAME, namespace: NAMESPACE } } as never,
      pvcName: EXPORT_PVC_NAME,
      secretName: EXPORT_SECRET_NAME,
    }),
};

const SLICE_CONFIGS: [string, SliceTestHelper][] = [
  ['uploads', uploadsHelper],
  ['exportDisk', exportDiskHelper],
];

const resetStore = (): void => {
  resetInFlightToastStore();
};

describe('inFlightToastStore', () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  afterEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe.each(SLICE_CONFIGS)('%s slice', (_sliceName, slice) => {
    describe('startUpload', () => describeStartUpload(slice));
    describe('updateProgress', () => describeUpdateProgress(slice));
    describe('completeUpload', () => describeCompleteUpload(slice));
    describe('failUpload', () => describeFailUpload(slice));
    describe('markUploadCanceled', () => describeMarkUploadCanceled(slice));
    describe('entry operations', () => describeEntryOperations(slice));
    describe('cancelTrackedUpload', () => describeCancelTrackedUpload(slice));
  });

  describe('uploads-specific actions', () => describeUploadsSpecific());
});
