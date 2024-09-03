import React, { FC, useMemo } from 'react';

import useClusterPreferences from '@catalog/CreateFromInstanceTypes/state/hooks/useClusterPreferences';
import {
  DEFAULT_PREFERENCE_KIND_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@catalog/CreateFromInstanceTypes/utils/constants';
import {
  VirtualMachineClusterPreferenceModelGroupVersionKind,
  VirtualMachinePreferenceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { SetBootableVolumeFieldType } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useUserPreferences from '@kubevirt-utils/hooks/useUserPreferences';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, PopoverPosition } from '@patternfly/react-core';

import { getResourceDropdownOptions } from './utils/utils';
import PreferencePopoverContent from './PreferencePopoverContent';

type PreferenceSelectProps = {
  deleteLabel: (labelKey: string) => void;
  selectedPreference: string;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const PreferenceSelect: FC<PreferenceSelectProps> = ({
  deleteLabel,
  selectedPreference,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();

  const [preferences, preferencesLoaded] = useClusterPreferences();
  const [userPreferences = [], userPreferencesLoaded] = useUserPreferences(activeNamespace);

  const options = useMemo(() => {
    const preferenceOptions: EnhancedSelectOptionProps[] = getResourceDropdownOptions(
      preferences,
      VirtualMachineClusterPreferenceModelGroupVersionKind,
      () => deleteLabel(DEFAULT_PREFERENCE_KIND_LABEL),
      t('Cluster preferences'),
    );

    const userPreferenceOptions: EnhancedSelectOptionProps[] = getResourceDropdownOptions(
      userPreferences,
      VirtualMachinePreferenceModelGroupVersionKind,
      () =>
        setBootableVolumeField(
          'labels',
          DEFAULT_PREFERENCE_KIND_LABEL,
        )(VirtualMachinePreferenceModelGroupVersionKind.kind),
      t('User preferences'),
    );
    return [...userPreferenceOptions, ...preferenceOptions];
  }, [preferences, userPreferences, deleteLabel, setBootableVolumeField, t]);

  if (!preferencesLoaded || !userPreferencesLoaded) return <Loading />;

  return (
    <FormGroup
      label={
        <>
          {t('Preference')}{' '}
          <HelpTextIcon
            bodyContent={<PreferencePopoverContent />}
            position={PopoverPosition.right}
          />
        </>
      }
      isRequired
    >
      <InlineFilterSelect
        options={options}
        selected={selectedPreference}
        setSelected={setBootableVolumeField('labels', DEFAULT_PREFERENCE_LABEL)}
        toggleProps={{ isFullWidth: true, placeholder: t('Select preference') }}
      />
    </FormGroup>
  );
};

export default PreferenceSelect;
