import { useMemo } from 'react';

import useClusterPreferences from '@catalog/CreateFromInstanceTypes/state/hooks/useClusterPreferences';
import { DEFAULT_PREFERENCE_KIND_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import {
  VirtualMachineClusterPreferenceModelGroupVersionKind,
  VirtualMachinePreferenceModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineClusterPreferenceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachinePreferenceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getResourceDropdownOptions } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/PreferenceSelect/utils/utils';
import { SetBootableVolumeFieldType } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useUserPreferences from '@kubevirt-utils/hooks/useUserPreferences';

type UsePreferenceSelectOptions = (
  namespace: string,
  setBootableVolumeField: SetBootableVolumeFieldType,
  cluster: string,
) => {
  preferenceSelectOptions: EnhancedSelectOptionProps[];
  preferencesLoaded: boolean;
};

const usePreferenceSelectOptions: UsePreferenceSelectOptions = (
  namespace,
  setBootableVolumeField,
  cluster,
) => {
  const { t } = useKubevirtTranslation();

  const [preferences, preferencesLoaded] = useClusterPreferences(null, null, cluster);
  const [userPreferences = [], userPreferencesLoaded] = useUserPreferences(
    namespace,
    null,
    null,
    cluster,
  );

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
  }, [preferences, userPreferences, setBootableVolumeField, t]);

  return {
    preferenceSelectOptions,
    preferencesLoaded: preferencesLoaded && userPreferencesLoaded,
  };
};

export default usePreferenceSelectOptions;
