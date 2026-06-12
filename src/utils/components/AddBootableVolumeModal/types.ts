import { Dispatch, SetStateAction } from 'react';
import { TFunction } from 'i18next';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import {
  TLS_CERT_SOURCE_EXISTING,
  TLS_CERT_SOURCE_NEW,
} from '@kubevirt-utils/components/TLSCertificateSection';
import { DataUpload, UploadDataProps } from '@kubevirt-utils/hooks/useCDIUpload/types';
import { ToastActions } from '@kubevirt-utils/hooks/useKubevirtToast';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';

import { DROPDOWN_FORM_SELECTION } from './consts';

export type PreferenceOption = {
  kind?: string;
  name: string;
};

export type AddBootableVolumeModalProps = {
  isOpen: boolean;
  lockedPreference?: PreferenceOption;
  onClose: () => void;
  onCreateVolume?: (createdVolume: BootableVolume) => void;
};

export type AddBootableVolumeState = {
  accessMode?: V1beta1StorageSpecAccessModesEnum;
  annotations?: { [key: string]: string };
  architectures?: string[];
  bootableVolumeCluster?: string;
  bootableVolumeName: string;
  bootableVolumeNamespace: string;
  cronExpression?: string;
  isIso?: boolean;
  labels?: { [key: string]: string };
  lockedPreference?: string;
  pvcName: string;
  pvcNamespace: string;
  registryCredentials?: { password: string; username: string };
  registryURL?: string;
  retainRevisions?: number;
  size?: string;
  snapshotName?: string;
  snapshotNamespace?: string;
  storageClassName?: string;
  tlsCertConfigMapName?: string;
  tlsCertificate?: string;
  tlsCertificateRequired?: boolean;
  tlsCertProject?: string;
  tlsCertSource?: typeof TLS_CERT_SOURCE_EXISTING | typeof TLS_CERT_SOURCE_NEW;
  uploadFile?: File | string;
  uploadFilename?: string;
  url?: string;
  volumeMode?: V1beta1StorageSpecVolumeModeEnum;
};

export type SetBootableVolumeFieldType = (
  key: keyof AddBootableVolumeState,
  fieldKey?: string,
) => (
  value: { password: string; username: string } | boolean | File | number | string | string[],
) => void;

export type SubmitAddBootableVolumeParams = {
  bootableVolume: AddBootableVolumeState;
  checkUploadReady: () => Promise<void>;
  dataSource: V1beta1DataSource;
  onClose: () => void;
  onCreateVolume?: (createdVolume: BootableVolume) => void;
  sourceType: DROPDOWN_FORM_SELECTION;
  t: TFunction;
  uploadData: (props: UploadDataProps) => Promise<void>;
};

export type HandleAddBootableVolumeModalCloseParams = {
  onClose: () => void;
  sourceType: DROPDOWN_FORM_SELECTION;
  upload?: DataUpload;
};

export type CreateBootableVolumeType = (input: {
  bootableVolume: AddBootableVolumeState;
  onCreateVolume?: (createdVolume: BootableVolume) => void;
  sourceType: DROPDOWN_FORM_SELECTION;
  t: TFunction;
  uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>;
}) => (dataSource: V1beta1DataSource) => Promise<V1beta1DataSource[]>;

export type UseAddBootableVolumeFormValidationParams = {
  bootableVolume: AddBootableVolumeState;
  sourceType: DROPDOWN_FORM_SELECTION;
};

export type UseAddBootableVolumeModalData = (lockedPreference?: PreferenceOption) => {
  bootableVolume: AddBootableVolumeState;
  checkUploadReady: () => Promise<void>;
  setBootableVolume: Dispatch<SetStateAction<AddBootableVolumeState>>;
  setSourceType: Dispatch<SetStateAction<DROPDOWN_FORM_SELECTION>>;
  sourceType: DROPDOWN_FORM_SELECTION;
  upload: DataUpload;
  uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>;
};

export type BootableVolumeToastHandlers = Pick<ToastActions, 'addInfoToast' | 'addSuccessToast'> & {
  navigate: (url: string) => void;
  t: TFunction;
};

export type CreateDataSourceWithImportCronType = (
  bootableVolume: AddBootableVolumeState,
  initialDataSource: V1beta1DataSource,
) => Promise<V1beta1DataSource>;
