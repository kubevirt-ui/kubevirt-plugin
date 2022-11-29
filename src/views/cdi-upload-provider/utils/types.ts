import { Canceler } from 'axios';

import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';

import { UPLOAD_STATUS } from './consts';

export type UploadingStatusProps = {
  upload: DataUpload;
  dataVolume?: V1beta1DataVolume;
  onSuccessClick?: () => void;
  onCancelClick?: () => void;
};

export type UploadDataProps = {
  file: File;
  token: string;
  pvcName: string;
  namespace: string;
};

export type DataUpload = {
  pvcName: string;
  namespace: string;
  fileName?: string;
  progress?: number;
  uploadStatus?: UPLOAD_STATUS;
  uploadError?: any;
  cancelUpload?: Canceler;
};

export type OperatingSystemRecord = {
  id: string;
  name: string;
  baseImageName?: string;
  baseImageNamespace?: string;
  baseImageRecomendedSize?: any;
  isSourceRef?: boolean;
};
