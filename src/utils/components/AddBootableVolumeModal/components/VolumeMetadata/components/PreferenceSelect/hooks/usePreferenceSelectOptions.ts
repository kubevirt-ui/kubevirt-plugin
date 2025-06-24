import { useMemo } from 'react';

import useClusterPreferences from '@catalog/CreateFromInstanceTypes/state/hooks/useClusterPreferences';
import { DEFAULT_PREFERENCE_KIND_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import {
  VirtualMachineClusterPreferenceModelGroupVersionKind,
  VirtualMachinePreferenceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineClusterPreferenceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterPreferenceModel';
import VirtualMachinePreferenceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachinePreferenceModel';
import { getResourceDropdownOptions } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/PreferenceSelect/utils/utils';
import { SetBootableVolumeFieldType } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useUserPreferences from '@kubevirt-utils/hooks/useUserPreferences';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

type UsePreferenceSelectOptions = (
  deleteLabel: (labelKey: string) => void,
  setBootableVolumeField: SetBootableVolumeFieldType,
) => {
  preferenceSelectOptions: EnhancedSelectOptionProps[];
  preferencesLoaded: boolean;
};

const usePreferenceSelectOptions: UsePreferenceSelectOptions = (
  deleteLabel,
  setBootableVolumeField,
) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();

  const [preferences, preferencesLoaded] = useClusterPreferences();
  const [userPreferences = [], userPreferencesLoaded] = useUserPreferences(activeNamespace);

  const preferenceSelectOptions = useMemo(() => {
    const preferenceOptions: EnhancedSelectOptionProps[] = getResourceDropdownOptions({
      group: t('Cluster preferences'),
      groupVersionKind: VirtualMachineClusterPreferenceModelGroupVersionKind,
      kind: VirtualMachineClusterPreferenceModel.kind,
      onClick: () =>
        setBootableVolumeField(
          'labels',
          DEFAULT_PREFERENCE_KIND_LABEL,
        )(VirtualMachineClusterPreferenceModelGroupVersionKind.kind),
      resources: preferences,
    });

    const userPreferenceOptions: EnhancedSelectOptionProps[] = getResourceDropdownOptions({
      group: t('User preferences'),
      groupVersionKind: VirtualMachinePreferenceModelGroupVersionKind,
      kind: VirtualMachinePreferenceModel.kind,
      onClick: () =>
        setBootableVolumeField(
          'labels',
          DEFAULT_PREFERENCE_KIND_LABEL,
        )(VirtualMachinePreferenceModelGroupVersionKind.kind),
      resources: userPreferences,
    });
    return [...userPreferenceOptions, ...preferenceOptions];
  }, [preferences, userPreferences, deleteLabel, setBootableVolumeField, t]);

  return {
    preferenceSelectOptions,
    preferencesLoaded: preferencesLoaded && userPreferencesLoaded,
  };
};

export default usePreferenceSelectOptions;
