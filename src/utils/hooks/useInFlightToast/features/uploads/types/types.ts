import { type UPLOAD_STATUS, type UploadError } from '@kubevirt-utils/hooks/useCDIUpload/types';
import {
  type InFlightToastStoreActions,
  type ProgressToastState,
  type ProgressToastStateParams,
} from '@kubevirt-utils/hooks/useInFlightToast/shared/types/types';

export type CdiUploadTrackMetadata = Partial<
  Pick<
    ProgressToastState,
    | 'abortTooltip'
    | 'contextLinks'
    | 'dvCluster'
    | 'dvName'
    | 'dvNamespace'
    | 'onCancelCleanup'
    | 'resourceName'
  >
>;

export type SyncCdiUploadParams = {
  expectedGeneration?: number;
  progress?: number;
  uploadError?: UploadError;
  uploadKey: string;
  uploadStatus?: UPLOAD_STATUS;
};

export type RegisterCdiUploadParams = {
  cancelUpload?: () => Promise<unknown> | void;
  fileName: string;
  metadata?: CdiUploadTrackMetadata;
  uploadKey: string;
};

type StripBootableVolumeLinksActions = {
  stripBootableVolumeLinks: (namespace: string, name: string, cluster?: string) => void;
  stripDataVolumeLinksForResource: (dvName: string, dvNamespace: string, cluster?: string) => void;
  stripVmStorageLinksForVm: (
    cluster: string,
    namespace: string,
    vmName: string,
    uploadKeys?: string[],
  ) => void;
};

export type UploadsStoreSliceActions = InFlightToastStoreActions &
  StripBootableVolumeLinksActions & {
    cancelUploadsForVm: (cluster: string, namespace: string, vmName: string) => Promise<void>;
    cancelWizardPendingUploads: (uploadKeys: string[]) => Promise<void>;
  };

export type UploadsStoreSliceData = Record<string, ProgressToastStateParams>;

export type UploadsStoreSlice = {
  actions: UploadsStoreSliceActions;
  data: UploadsStoreSliceData;
  generationsByKey: Record<string, number>;
};
