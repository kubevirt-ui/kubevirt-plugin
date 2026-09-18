import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { type EnhancedSelectOptionProps } from '../FilterSelect/utils/types';
import { SysprepSelectionOption } from './types';

type IsSysprepSubmitDisabledParams = {
  autoUnattend: string;
  canCreateConfigMap: boolean;
  initialSysprepSelected?: string;
  selectedSysprepName: string;
  selectionOption: SysprepSelectionOption;
  unattend: string;
};

export const getInitialSysprepSelection = (sysprepSelected?: string): SysprepSelectionOption =>
  !isEmpty(sysprepSelected) ? SysprepSelectionOption.UseExisting : SysprepSelectionOption.None;

export const isValidSysprepXml = (xml: string): boolean => {
  try {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');

    return doc.getElementsByTagName('parsererror').length === 0;
  } catch {
    return false;
  }
};

const isValidSysprepField = (value?: string): boolean => {
  const trimmedValue = value?.trim();

  return Boolean(trimmedValue) && isValidSysprepXml(trimmedValue);
};

export const isSysprepSubmitDisabled = ({
  autoUnattend,
  canCreateConfigMap,
  initialSysprepSelected,
  selectedSysprepName,
  selectionOption,
  unattend,
}: IsSysprepSubmitDisabledParams): boolean => {
  if (selectionOption === SysprepSelectionOption.CreateNew && canCreateConfigMap) {
    return !isValidSysprepField(unattend) || !isValidSysprepField(autoUnattend);
  }

  if (selectionOption === SysprepSelectionOption.None) {
    return isEmpty(initialSysprepSelected);
  }

  return isEmpty(selectedSysprepName);
};

export const getSysprepSelectOptions = (
  sysprepConfigMaps: IoK8sApiCoreV1ConfigMap[] | undefined,
  selectedSysprepName: string,
): EnhancedSelectOptionProps[] => {
  const configMapOptions =
    sysprepConfigMaps?.map((configMap) => {
      const name = getName(configMap);

      return {
        children: name,
        groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
        value: name,
      };
    }) ?? [];

  if (
    !isEmpty(selectedSysprepName) &&
    !configMapOptions.some((option) => option.value === selectedSysprepName)
  ) {
    configMapOptions.push({
      children: selectedSysprepName,
      groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
      value: selectedSysprepName,
    });
  }

  return configMapOptions;
};
