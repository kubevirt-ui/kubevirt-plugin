import { type FC, type ReactElement, useEffect, useMemo } from 'react';

import usePreferenceSelectOptions from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/PreferenceSelect/hooks/usePreferenceSelectOptions';
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

import PreferencePopoverContent from './PreferencePopoverContent';
import { getSelectedKeyByLabel } from './utils/utils';

type PreferenceSelectProps = {
  cluster?: string;
  deleteLabel: (labelKey: string) => void;
  isDisabled?: boolean;
  label?: string;
  labels?: Record<string, string>;
  lockedPreference?: string;
  namespace: string;
  placeholder?: string;
  setLabel: (labelKey: string, value: string) => void;
};

const PreferenceSelect: FC<PreferenceSelectProps> = ({
  cluster,
  deleteLabel,
  isDisabled,
  label,
  labels,
  lockedPreference,
  namespace,
  placeholder,
  setLabel,
}): ReactElement => {
  const { t } = useKubevirtTranslation();

  const { preferenceSelectOptions, preferencesLoaded } = usePreferenceSelectOptions(
    namespace,
    setLabel,
    cluster,
  );

  const handleSelect = (value: string): void => {
    const selectedOption = preferenceSelectOptions.find((option) => option.value === value);
    if (!selectedOption) return;
    setLabel(DEFAULT_PREFERENCE_LABEL, selectedOption.label);
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
    if (!preferencesLoaded || lockedPreference) return;
    if (!isExistingOption) {
      deleteLabel(DEFAULT_PREFERENCE_LABEL);
      deleteLabel(DEFAULT_PREFERENCE_KIND_LABEL);
    }
  }, [deleteLabel, isExistingOption, lockedPreference, preferencesLoaded]);

  if (!preferencesLoaded) return <Loading />;

  return (
    <FormGroup
      isRequired
      label={label ?? t('Preference')}
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
    >
      <InlineFilterSelect
        options={preferenceSelectOptions}
        placeholder={placeholder ?? t('Select preference')}
        selected={selectedPreferenceKey}
        setSelected={handleSelect}
        toggleProps={{
          isDisabled: isDisabled || !!lockedPreference,
          isFullWidth: true,
        }}
      />
      {lockedPreference && (
        <HelperText>{t('Automatically set by the VM Guest OS selection.')}</HelperText>
      )}
    </FormGroup>
  );
};

export default PreferenceSelect;
