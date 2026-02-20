import React, { FC, useEffect, useMemo } from 'react';

import {
  DEFAULT_PREFERENCE_KIND_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@catalog/CreateFromInstanceTypes/utils/constants';
import usePreferenceSelectOptions from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/PreferenceSelect/hooks/usePreferenceSelectOptions';
import {
  AddBootableVolumeState,
  SetBootableVolumeFieldType,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { FormGroup, PopoverPosition } from '@patternfly/react-core';

import { getSelectedKeyByLabel } from './utils/utils';
import PreferencePopoverContent from './PreferencePopoverContent';

type PreferenceSelectProps = {
  bootableVolume: AddBootableVolumeState;
  deleteLabel: (labelKey: string) => void;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const PreferenceSelect: FC<PreferenceSelectProps> = ({
  bootableVolume,
  deleteLabel,
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
    if (!isExistingOption) {
      deleteLabel(DEFAULT_PREFERENCE_LABEL);
      deleteLabel(DEFAULT_PREFERENCE_KIND_LABEL);
    }
  }, [deleteLabel, isExistingOption]);

  if (!preferencesLoaded) return <Loading />;

  return (
    <FormGroup
      label={
        <>
          {t('Preference')}{' '}
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
        </>
      }
      isRequired
    >
      <InlineFilterSelect
        options={preferenceSelectOptions}
        selected={selectedPreferenceKey}
        setSelected={handleSelect}
        toggleProps={{ isFullWidth: true, placeholder: t('Select preference') }}
      />
    </FormGroup>
  );
};

export default PreferenceSelect;
