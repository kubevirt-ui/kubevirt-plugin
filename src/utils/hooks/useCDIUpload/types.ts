import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { CdiUploadTrackMetadata } from '../useUploadProgressToast/utils/types';

export enum UPLOAD_STATUS {
  ALLOCATING = 'ALLOCATING',
  CANCELED = 'CANCELED',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  UPLOADING = 'UPLOADING',
}

export type CDIConfig = K8sResourceCommon & {
  status: {
    uploadProxyURL: string;
  };
};

export type UploadError = {
  href?: string;
  message?: string;
};

export const getUploadErrorMessage = (uploadError?: UploadError): string =>
  uploadError?.message ?? '';

export type DataUpload = {
  cancelUpload?: () => Promise<{
    metadata: {
      name: string;
      namespace: string;
    };
  }>;
  fileName?: string;
  namespace: string;
  progress?: number;
  pvcName: string;
  uploadError?: UploadError;
  uploadStatus?: UPLOAD_STATUS;
};

export type UploadDataProps = {
  dataVolume: V1beta1DataVolume;
  file: File;
  uploadKey?: string;
  uploadTrackMetadata?: CdiUploadTrackMetadata;
};

export type UseCDIUploadValues = {
  checkUploadReady: () => Promise<void>;
  upload: DataUpload;
  uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>;
};
