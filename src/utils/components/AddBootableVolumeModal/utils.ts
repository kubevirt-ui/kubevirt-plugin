import { TFunction } from 'i18next';

import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { TabModalResult } from '@kubevirt-utils/components/TabModal/TabModal';
import { DEFAULT_INSTANCETYPE_LABEL } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { isUploadCanceledError } from '@kubevirt-utils/hooks/useCDIUpload/errors';
import { cancelTrackedUploadOnModalClose } from '@kubevirt-utils/hooks/useUploadProgressToast/cancel/modalUploadCancel';
import { appendBootableVolumeContext } from '@kubevirt-utils/resources/bootableresources/constants';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getLabel, getResourceUrl } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getFieldRequiredMessage } from '@kubevirt-utils/utils/validation';

import { isUploadVolumeSource, SOURCE_DETAILS_SECTION_ID } from './consts';
import { createBootableVolume } from './createBootableVolume';
import {
  AddBootableVolumeState,
  HandleAddBootableVolumeModalCloseParams,
  SubmitAddBootableVolumeParams,
} from './types';

export const formatRegistryURL = (registryURL: string) =>
  registryURL?.replace(/^(https?:\/\/)/i, '');

export const extractCreatedDataSources = (result: unknown): V1beta1DataSource[] => {
  const items = Array.isArray(result) ? result : [result];
  return items.filter(
    (item): item is V1beta1DataSource =>
      !!item &&
      typeof item === 'object' &&
      'kind' in item &&
      (item as { kind: string }).kind === DataSourceModel.kind,
  );
};

export const updateBootableVolumeField = (
  prevState: AddBootableVolumeState,
  key: keyof AddBootableVolumeState,
  value: AddBootableVolumeState[keyof AddBootableVolumeState],
  fieldKey?: string,
): AddBootableVolumeState => ({
  ...prevState,
  ...(fieldKey
    ? { [key]: { ...(prevState[key] as object), [fieldKey]: value } }
    : { [key]: value }),
});

export const deleteBootableVolumeLabel = (
  prevState: AddBootableVolumeState,
  labelKey: string,
): AddBootableVolumeState => {
  const updatedLabels = { ...prevState?.labels };
  delete updatedLabels[labelKey];
  return { ...prevState, labels: updatedLabels };
};

export const getCronHelperText = (
  t: TFunction,
  isCronFormatInvalid: boolean,
  isCronRequiredInvalid: boolean,
  cronFormatError: string | undefined,
): string => {
  if (isCronFormatInvalid) return cronFormatError ?? t('Invalid cron format');
  if (isCronRequiredInvalid) return getFieldRequiredMessage(t);
  return t('Example (At 00:00 on Tuesday): 0 0 * * 2.');
};

export const getInstanceTypeFromVolume = (bootableVolume: BootableVolume): string =>
  getLabel(bootableVolume, DEFAULT_INSTANCETYPE_LABEL, '');

export const getAddBootableVolumeSubmitBtnText = (t: TFunction, isUploading: boolean): string =>
  isUploading ? t('Uploading') : t('Save');

export const getCreatedBootableVolumeUrl = (createdVolume: V1beta1DataSource): string =>
  appendBootableVolumeContext(getResourceUrl({ model: DataSourceModel, resource: createdVolume }));

export const handleAddBootableVolumeModalClose = ({
  onClose,
  sourceType,
  upload,
}: HandleAddBootableVolumeModalCloseParams): void => {
  cancelTrackedUploadOnModalClose({ sourceType, upload });
  onClose();
};

export const submitAddBootableVolume = async ({
  bootableVolume,
  checkUploadReady,
  dataSource,
  onClose,
  onCreateVolume,
  sourceType,
  t,
  uploadData,
}: SubmitAddBootableVolumeParams): Promise<TabModalResult<V1beta1DataSource>> => {
  if (isUploadVolumeSource(sourceType)) {
    document.getElementById(SOURCE_DETAILS_SECTION_ID)?.scrollIntoView();
    await checkUploadReady();
  }

  const createVolume = createBootableVolume({
    bootableVolume,
    onCreateVolume,
    sourceType,
    t,
    uploadData,
  });

  if (isUploadVolumeSource(sourceType)) {
    void (async () => {
      try {
        await createVolume(dataSource);
      } catch (error) {
        if (!isUploadCanceledError(error)) {
          kubevirtConsole.error(error);
        }
      }
    })();
    onClose();
    return Promise.resolve();
  }

  try {
    return await createVolume(dataSource);
  } catch (error) {
    if (isUploadCanceledError(error)) {
      return;
    }
    throw error;
  }
};
