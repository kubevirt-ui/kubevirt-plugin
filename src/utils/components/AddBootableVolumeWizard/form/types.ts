import type {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type DROPDOWN_FORM_SELECTION } from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import type { PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';

export type BootableVolumeWizardProjectAndVolumeValues = {
  description: string;
  destinationProject: string;
  volumeName: string;
};

export type BootableVolumeWizardUploadValues = {
  file?: File | string;
  filename: string;
};

export type BootableVolumeWizardExistingVolumeValues = {
  clone: boolean;
  name: string;
  project: string;
};

export type BootableVolumeWizardExistingSnapshotValues = {
  name: string;
  project: string;
};

export type BootableVolumeWizardRegistryValues = {
  cronExpression: string;
  image: string;
  password: string;
  retainRevisions: number;
  username: string;
};

export type BootableVolumeWizardURLValues = {
  certificate?: string;
  certificateSource?: string;
  configMapName?: string;
  imageUrl: string;
  project?: string;
  tlsCertificateRequired: boolean;
};

export type BootableVolumeWizardImageSourceValues = {
  accessMode?: V1beta1StorageSpecAccessModesEnum;
  diskSize: string;
  existingSnapshot: BootableVolumeWizardExistingSnapshotValues;
  existingVolume: BootableVolumeWizardExistingVolumeValues;
  registry: BootableVolumeWizardRegistryValues;
  sourceType: DROPDOWN_FORM_SELECTION;
  storageClassName: string;
  upload: BootableVolumeWizardUploadValues;
  url: BootableVolumeWizardURLValues;
  volumeMode?: V1beta1StorageSpecVolumeModeEnum;
};

export type BootableVolumeWizardOperatingSystemValues = {
  architecture: string;
  defaultInstanceType?: string;
  operatingSystem: string;
  preference: null | PreferenceOption;
  preferenceKind?: string;
};

export type BootableVolumeWizardFormValues = {
  imageSource: BootableVolumeWizardImageSourceValues;
  operatingSystem: BootableVolumeWizardOperatingSystemValues;
  projectAndVolume: BootableVolumeWizardProjectAndVolumeValues;
};

export type BootableVolumeWizardDefaultValuesArgs = {
  lockedPreference?: PreferenceOption;
  namespace?: string;
};

export type BootableVolumeWizardInitialValues = BootableVolumeWizardDefaultValuesArgs & {
  cluster?: string;
};
