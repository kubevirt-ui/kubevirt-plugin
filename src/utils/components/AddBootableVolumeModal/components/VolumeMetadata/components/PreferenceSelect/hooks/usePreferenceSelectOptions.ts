import { useMemo } from 'react';

import {
  VirtualMachineClusterPreferenceModelGroupVersionKind,
  VirtualMachinePreferenceModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineClusterPreferenceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachinePreferenceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getResourceDropdownOptions } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/PreferenceSelect/utils/utils';
import type { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { DEFAULT_PREFERENCE_KIND_LABEL } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import useClusterPreferences from '@kubevirt-utils/hooks/useClusterPreferences';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useUserPreferences from '@kubevirt-utils/hooks/useUserPreferences';

type SetLabel = (labelKey: string, value: string) => void;

type UsePreferenceSelectOptions = (
  namespace: string,
  setLabel: SetLabel,
  cluster?: string,
) => {
  preferenceSelectOptions: EnhancedSelectOptionProps[];
  preferencesLoaded: boolean;
};

const usePreferenceSelectOptions: UsePreferenceSelectOptions = (namespace, setLabel, cluster) => {
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
        setLabel(
          DEFAULT_PREFERENCE_KIND_LABEL,
          VirtualMachineClusterPreferenceModelGroupVersionKind.kind,
        ),
      resources: preferences,
    });

    const userPreferenceOptions: EnhancedSelectOptionProps[] = getResourceDropdownOptions({
      group: t('User preferences'),
      groupVersionKind: VirtualMachinePreferenceModelGroupVersionKind,
      kind: VirtualMachinePreferenceModel.kind,
      onClick: () =>
        setLabel(DEFAULT_PREFERENCE_KIND_LABEL, VirtualMachinePreferenceModelGroupVersionKind.kind),
      resources: userPreferences,
    });

    return [...userPreferenceOptions, ...preferenceOptions];
  }, [preferences, setLabel, t, userPreferences]);

  return {
    preferenceSelectOptions,
    preferencesLoaded: preferencesLoaded && userPreferencesLoaded,
  };
};

export default usePreferenceSelectOptions;
