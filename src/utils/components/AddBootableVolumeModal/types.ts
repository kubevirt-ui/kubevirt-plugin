import type { TFunction } from 'i18next';

import type {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import type {
  TLS_CERT_SOURCE_EXISTING,
  TLS_CERT_SOURCE_NEW,
} from '@kubevirt-utils/components/TLSCertificateSection';
import type { ToastActions } from '@kubevirt-utils/hooks/useKubevirtToast';
import type { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';

export type PreferenceOption = {
  architecture?: string;
  availablePreferences?: PreferenceOption[];
  displayName?: string;
  kind?: string;
  name: string;
};

/** Disk-flow UI state and create payload (wizard uses BootableVolumeWizardFormValues). */
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

export type BootableVolumeToastHandlers = Pick<ToastActions, 'addInfoToast' | 'addSuccessToast'> & {
  navigate: (url: string) => void;
  t: TFunction;
};

export type BootableVolumeCreateCallbacks = {
  onCreateVolume?: (createdVolume: BootableVolume) => void;
  onUploadStart?: (uploadKey: string) => void;
};
