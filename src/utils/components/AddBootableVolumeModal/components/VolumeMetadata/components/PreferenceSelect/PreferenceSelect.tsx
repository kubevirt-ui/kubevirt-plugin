import React, { FC, useEffect, useMemo } from 'react';

import usePreferenceSelectOptions from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/PreferenceSelect/hooks/usePreferenceSelectOptions';
import {
  AddBootableVolumeState,
  SetBootableVolumeFieldType,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import {
  DEFAULT_PREFERENCE_KIND_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { FormGroup, HelperText, PopoverPosition } from '@patternfly/react-core';

import { getSelectedKeyByLabel } from './utils/utils';
import PreferencePopoverContent from './PreferencePopoverContent';

type PreferenceSelectProps = {
  bootableVolume: AddBootableVolumeState;
  deleteLabel: (labelKey: string) => void;
  isDisabled?: boolean;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const PreferenceSelect: FC<PreferenceSelectProps> = ({
  bootableVolume,
  deleteLabel,
  isDisabled,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();

  const { bootableVolumeCluster, bootableVolumeNamespace, labels } = bootableVolume;
  const { preferenceSelectOptions, preferencesLoaded } = usePreferenceSelectOptions(
    bootableVolumeNamespace,
    setBootableVolumeField,
    bootableVolumeCluster,
  );

  const handleSelect = (value: string) => {
    const selectedOption = preferenceSelectOptions.find((option) => option.value === value);
    if (!selectedOption) return;
    setBootableVolumeField('labels', DEFAULT_PREFERENCE_LABEL)(selectedOption.label);
  };

  const selectedPreference = labels?.[DEFAULT_PREFERENCE_LABEL];
  const selectedPreferenceKey = getSelectedKeyByLabel(
    selectedPreference,
    preferenceSelectOptions,
    labels,
  );

  const isExistingOption = useMemo(
    () => preferenceSelectOptions?.some((option) => option.value === selectedPreferenceKey),
    [preferenceSelectOptions, selectedPreferenceKey],
  );

  useEffect(() => {
    if (!preferencesLoaded || bootableVolume.lockedPreference) return;
    if (!isExistingOption) {
      deleteLabel(DEFAULT_PREFERENCE_LABEL);
      deleteLabel(DEFAULT_PREFERENCE_KIND_LABEL);
    }
  }, [deleteLabel, isExistingOption, bootableVolume.lockedPreference, preferencesLoaded]);

  if (!preferencesLoaded) return <Loading />;

  return (
    <FormGroup
      labelHelp={
        <HelpTextIcon
          bodyContent={(hide) => (
            <PopoverContentWithLightspeedButton
              content={<PreferencePopoverContent />}
              hide={hide}
              promptType={OLSPromptType.PREFERENCE}
            />
          )}
          position={PopoverPosition.right}
        />
      }
      isRequired
      label={t('Preference')}
    >
      <InlineFilterSelect
        toggleProps={{
          isDisabled: isDisabled || !!bootableVolume.lockedPreference,
          isFullWidth: true,
        }}
        options={preferenceSelectOptions}
        placeholder={t('Select preference')}
        selected={selectedPreferenceKey}
        setSelected={handleSelect}
      />
      {bootableVolume.lockedPreference && (
        <HelperText>{t('Automatically set by the VM Guest OS selection.')}</HelperText>
      )}
    </FormGroup>
  );
};

export default PreferenceSelect;
