import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { type CdiUploadTrackMetadata } from '../useUploadProgressToast/types';
// eslint-disable-next-line @typescript-eslint/naming-convention -- Will be removed in later PR
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
  cancelUpload?: () => Promise<K8sResourceCommon>;
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
