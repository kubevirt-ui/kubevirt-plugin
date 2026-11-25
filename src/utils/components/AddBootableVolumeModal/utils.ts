import { type TFunction } from 'i18next';

import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { DEFAULT_INSTANCETYPE_LABEL } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { appendBootableVolumeContext } from '@kubevirt-utils/resources/bootableresources/constants';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getLabel, getResourceUrl } from '@kubevirt-utils/resources/shared';
import { getFieldRequiredMessage } from '@kubevirt-utils/utils/validation';

export const formatRegistryURL = (registryURL: string): string =>
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

export const getCreatedBootableVolumeUrl = (createdVolume: V1beta1DataSource): string =>
  appendBootableVolumeContext(getResourceUrl({ model: DataSourceModel, resource: createdVolume }));
