import {
  VirtualMachineClusterPreferenceModelGroupVersionKind,
  VirtualMachinePreferenceModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineClusterPreferenceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { DEFAULT_PREFERENCE_KIND_LABEL } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  type K8sGroupVersionKind,
  type K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';

type ResourceDropdownOptionParams = {
  group?: string;
  groupVersionKind: K8sGroupVersionKind;
  kind?: string;
  onClick: () => void;
  resources: K8sResourceCommon[];
};

export const getResourceDropdownOptions = ({
  group,
  groupVersionKind,
  kind,
  onClick,
  resources,
}: ResourceDropdownOptionParams): EnhancedSelectOptionProps[] =>
  resources
    ?.map((resource) => getName(resource) as string)
    ?.sort((a, b) => a.localeCompare(b))
    ?.map((opt) => ({
      children: opt,
      group,
      groupVersionKind,
      label: opt,
      onClick,
      value: kind ? `${kind}-${opt}` : opt,
    }));

export const getSelectedKeyByLabel = (
  label: string,
  options: EnhancedSelectOptionProps[],
  volumeLabels: { [key: string]: string },
): string | undefined => {
  // Name could be duplicated between cluster and user Preferences
  const matchingOptions = options.filter((option) => option.label === label);

  const isClusterPreference =
    volumeLabels?.[DEFAULT_PREFERENCE_KIND_LABEL] === VirtualMachineClusterPreferenceModel.kind;

  const groupVersionKind = isClusterPreference
    ? VirtualMachineClusterPreferenceModelGroupVersionKind
    : VirtualMachinePreferenceModelGroupVersionKind;

  return matchingOptions.find((option) => option.groupVersionKind === groupVersionKind)?.value;
};
