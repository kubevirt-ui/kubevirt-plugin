import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export const OTHER = t('Other');
export const CONTAINER_EPHERMAL = t('Container (Ephemeral)');
export const DYNAMIC = t('Dynamic');

export const DISKTYPE_SELECT_FIELDID = 'disk-type-select';
export const STORAGECLASS_SELECT_FIELDID = 'storage-class-select';
export const ACCESS_MODE_FIELDID = 'access-mode';
export const VOLUMEMODE_FIELDID = 'volume-mode';
export const ENABLE_PREALLOCATION_FIELDID = 'enable-preallocation';

export const SHARABLE_FIELD = 'disk.shareable';
export const LUN_RESERVATION_FIELD = 'disk.lun.reservation';
export const DATAVOLUME_PVC_NAME = 'dataVolumeTemplate.spec.source.pvc.name';
export const DATAVOLUME_PVC_NAMESPACE = 'dataVolumeTemplate.spec.source.pvc.namespace';
export const DATAVOLUME_DATASOURCE_NAMESPACE = 'dataVolumeTemplate.spec.sourceRef.namespace';
export const DATAVOLUME_DATASOURCE_NAME = 'dataVolumeTemplate.spec.sourceRef.name';
export const DATAVOLUME_SNAPSHOT_NAME = 'dataVolumeTemplate.spec.source.snapshot.name';
export const DATAVOLUME_SNAPSHOT_NAMESPACE = 'dataVolumeTemplate.spec.source.snapshot.namespace';
export const DATAVOLUME_HTTPURL_FIELD = 'dataVolumeTemplate.spec.source.http.url';

export const IS_BOOT_SOURCE_FIELD = 'isBootSource';
export const DISK_TYPE_FIELD = 'diskType';
export const DISK_NAME_FIELD = 'disk.name';
export const VOLUME_NAME_FIELD = 'volume.name';
export const DISK_SIZE_FIELD = 'dataVolumeTemplate.spec.storage.resources.requests.storage';
export const UPLOAD_FILENAME_FIELD = 'uploadFile.filename';
export const UPLOAD_FILE_FIELD = 'uploadFile.file';
export const STORAGE_CLASS_FIELD = 'dataVolumeTemplate.spec.storage.storageClassName';
export const STORAGE_CLASS_PROVIDER_FIELD = 'storageClassProvisioner';
export const ENALBE_PREACCLOCATION_FIELD = 'dataVolumeTemplate.spec.preallocation';
export const ACCESS_MODE_FIELD = 'dataVolumeTemplate.spec.storage.accessModes';
export const STORAGE_PROFILE_SETTINGS_APPLIED_FIELD = 'storageProfileSettingsApplied';
export const VOLUME_MODE_FIELD = 'dataVolumeTemplate.spec.storage.volumeMode';
export const DATAVOLUME_TEMPLATE_STORAGE = 'dataVolumeTemplate.spec.storage';

export const CONTAINERDISK_IMAGE_FIELD = 'volume.containerDisk.image';

export const PVC_CLAIMNAME_FIELD = 'volume.persistentVolumeClaim.claimName';

export const REGISTRYURL_DATAVOLUME_FIELD = 'dataVolumeTemplate.spec.source.registry.url';
