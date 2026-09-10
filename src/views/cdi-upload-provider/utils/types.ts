import { type Canceler } from 'axios';

import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';

import { type UPLOAD_STATUS } from './consts';

export type UploadingStatusProps = {
  dataVolume?: V1beta1DataVolume;
  onCancelClick?: () => void;
  onSuccessClick?: () => void;
  upload: DataUpload;
};

export type UploadDataProps = {
  file: File;
  namespace: string;
  pvcName: string;
  token: string;
};

export type DataUpload = {
  cancelUpload?: Canceler;
  fileName?: string;
  namespace: string;
  progress?: number;
  pvcName: string;
  uploadError?: { message: string };
  uploadStatus?: UPLOAD_STATUS;
};

export type OperatingSystemRecord = {
  baseImageName?: string;
  baseImageNamespace?: string;
  baseImageRecomendedSize?: [string, string | undefined];
  id: string;
  isSourceRef?: boolean;
  name: string;
};
