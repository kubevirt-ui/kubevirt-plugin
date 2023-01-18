import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';

import { DEFAULT_PREFERENCE_LABEL } from '../../../utils/constants';

type ItemsToFilterProps = {
  id: string;
  title: string;
};

export const getItemNameWithOther = (itemName: string, items: ItemsToFilterProps[]): string => {
  return !items?.find((s: ItemsToFilterProps) => s.id === itemName) || itemName === 'Other'
    ? 'Other'
    : itemName;
};

export const getBootVolumeOS = (bootVolume: V1beta1DataSource): OS_NAME_TYPES => {
  const bootVolumePreference = bootVolume?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL];
  return (
    Object.values(OS_NAME_TYPES).find((osName) => bootVolumePreference?.includes(osName)) ??
    OS_NAME_TYPES.other
  );
};
