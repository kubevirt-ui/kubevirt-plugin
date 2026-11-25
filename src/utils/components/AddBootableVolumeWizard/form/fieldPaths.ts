import type { FieldPath } from 'react-hook-form';

import type { BootableVolumeWizardFormValues } from './types';

type WizardFieldPath = FieldPath<BootableVolumeWizardFormValues>;

export const DESTINATION_PROJECT_FIELD =
  'projectAndVolume.destinationProject' satisfies WizardFieldPath;
export const VOLUME_DESCRIPTION_FIELD = 'projectAndVolume.description' satisfies WizardFieldPath;
export const VOLUME_NAME_FIELD = 'projectAndVolume.volumeName' satisfies WizardFieldPath;

export const IMAGE_SOURCE_FIELD = 'imageSource' satisfies WizardFieldPath;
export const IMAGE_SOURCE_DISK_SIZE_FIELD = 'imageSource.diskSize' satisfies WizardFieldPath;
export const IMAGE_SOURCE_EXISTING_SNAPSHOT_NAME_FIELD =
  'imageSource.existingSnapshot.name' satisfies WizardFieldPath;
export const IMAGE_SOURCE_EXISTING_SNAPSHOT_PROJECT_FIELD =
  'imageSource.existingSnapshot.project' satisfies WizardFieldPath;
export const IMAGE_SOURCE_EXISTING_VOLUME_NAME_FIELD =
  'imageSource.existingVolume.name' satisfies WizardFieldPath;
export const IMAGE_SOURCE_EXISTING_VOLUME_PROJECT_FIELD =
  'imageSource.existingVolume.project' satisfies WizardFieldPath;
export const IMAGE_SOURCE_REGISTRY_CRON_FIELD =
  'imageSource.registry.cronExpression' satisfies WizardFieldPath;
export const IMAGE_SOURCE_REGISTRY_IMAGE_FIELD =
  'imageSource.registry.image' satisfies WizardFieldPath;
export const IMAGE_SOURCE_REGISTRY_PASSWORD_FIELD =
  'imageSource.registry.password' satisfies WizardFieldPath;
export const IMAGE_SOURCE_REGISTRY_RETAIN_REVISIONS_FIELD =
  'imageSource.registry.retainRevisions' satisfies WizardFieldPath;
export const IMAGE_SOURCE_REGISTRY_USERNAME_FIELD =
  'imageSource.registry.username' satisfies WizardFieldPath;
export const IMAGE_SOURCE_SOURCE_TYPE_FIELD = 'imageSource.sourceType' satisfies WizardFieldPath;
export const IMAGE_SOURCE_UPLOAD_FILE_FIELD = 'imageSource.upload.file' satisfies WizardFieldPath;
export const IMAGE_SOURCE_URL_CERTIFICATE_FIELD =
  'imageSource.url.certificate' satisfies WizardFieldPath;
export const IMAGE_SOURCE_URL_CONFIG_MAP_NAME_FIELD =
  'imageSource.url.configMapName' satisfies WizardFieldPath;
export const IMAGE_SOURCE_URL_IMAGE_URL_FIELD =
  'imageSource.url.imageUrl' satisfies WizardFieldPath;

export const OPERATING_SYSTEM_ARCHITECTURE_FIELD =
  'operatingSystem.architecture' satisfies WizardFieldPath;
export const OPERATING_SYSTEM_ARCHITECTURES_FIELD =
  'operatingSystem.architectures' satisfies WizardFieldPath;
export const OPERATING_SYSTEM_DEFAULT_INSTANCE_TYPE_FIELD =
  'operatingSystem.defaultInstanceType' satisfies WizardFieldPath;
export const OPERATING_SYSTEM_FIELD = 'operatingSystem.operatingSystem' satisfies WizardFieldPath;
export const OPERATING_SYSTEM_LABELS_FIELD = 'operatingSystem.labels' satisfies WizardFieldPath;
export const OPERATING_SYSTEM_LOCKED_PREFERENCE_FIELD =
  'operatingSystem.lockedPreference' satisfies WizardFieldPath;
export const OPERATING_SYSTEM_PREFERENCE_FIELD =
  'operatingSystem.preference' satisfies WizardFieldPath;
export const OPERATING_SYSTEM_PREFERENCE_KIND_FIELD =
  'operatingSystem.preferenceKind' satisfies WizardFieldPath;

export const IMAGE_SOURCE_STEP_FIELDS = [
  IMAGE_SOURCE_SOURCE_TYPE_FIELD,
  IMAGE_SOURCE_DISK_SIZE_FIELD,
  IMAGE_SOURCE_UPLOAD_FILE_FIELD,
  IMAGE_SOURCE_EXISTING_VOLUME_PROJECT_FIELD,
  IMAGE_SOURCE_EXISTING_VOLUME_NAME_FIELD,
  IMAGE_SOURCE_EXISTING_SNAPSHOT_PROJECT_FIELD,
  IMAGE_SOURCE_EXISTING_SNAPSHOT_NAME_FIELD,
  IMAGE_SOURCE_REGISTRY_IMAGE_FIELD,
  IMAGE_SOURCE_REGISTRY_CRON_FIELD,
  IMAGE_SOURCE_REGISTRY_USERNAME_FIELD,
  IMAGE_SOURCE_REGISTRY_PASSWORD_FIELD,
  IMAGE_SOURCE_REGISTRY_RETAIN_REVISIONS_FIELD,
  IMAGE_SOURCE_URL_IMAGE_URL_FIELD,
  IMAGE_SOURCE_URL_CERTIFICATE_FIELD,
  IMAGE_SOURCE_URL_CONFIG_MAP_NAME_FIELD,
] as const satisfies readonly WizardFieldPath[];
