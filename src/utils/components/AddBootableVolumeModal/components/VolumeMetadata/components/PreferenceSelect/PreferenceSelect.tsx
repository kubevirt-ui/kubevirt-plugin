import React, { FC } from 'react';

import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { VirtualMachineClusterPreferenceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { SetBootableVolumeFieldType } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, PopoverPosition } from '@patternfly/react-core';

import PreferencePopoverContent from './PreferencePopoverContent';

type PreferenceSelectProps = {
  preferencesNames: string[];
  selectedPreference: string;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const PreferenceSelect: FC<PreferenceSelectProps> = ({
  preferencesNames,
  selectedPreference,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();
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
        options={preferencesNames
          ?.sort((a, b) => a.localeCompare(b))
          ?.map((opt) => ({
            children: opt,
            groupVersionKind: VirtualMachineClusterPreferenceModelGroupVersionKind,
            value: opt,
          }))}
        selected={selectedPreference}
        setSelected={setBootableVolumeField('labels', DEFAULT_PREFERENCE_LABEL)}
        toggleProps={{ isFullWidth: true, placeholder: t('Select preference') }}
      />
    </FormGroup>
  );
};

export default PreferenceSelect;
