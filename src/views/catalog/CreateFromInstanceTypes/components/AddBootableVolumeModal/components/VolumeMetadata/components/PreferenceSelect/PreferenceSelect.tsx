import React, { FC } from 'react';

import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { VirtualMachineClusterPreferenceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, PopoverPosition } from '@patternfly/react-core';

import FilterSelect from '../../../FilterSelect/FilterSelect';

type PreferenceSelectProps = {
  selectedPreference: string;
  setBootableVolumeField: (key: string, fieldKey?: string) => (value: string) => void;
  preferencesNames: string[];
};

const PreferenceSelect: FC<PreferenceSelectProps> = ({
  selectedPreference,
  setBootableVolumeField,
  preferencesNames,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <FormGroup
      label={
        <>
          {t('Preference')}{' '}
          <HelpTextIcon
            bodyContent={
              <>
                {t(
                  'The preferred VirtualMachine attribute values required to run a given workload.',
                )}{' '}
                <ExternalLink
                  href={
                    'https://kubevirt.io/user-guide/virtual_machines/instancetypes/#virtualmachinepreference'
                  }
                  text={t('Read more')}
                />
              </>
            }
            position={PopoverPosition.right}
          />
        </>
      }
      isRequired
    >
      <FilterSelect
        selected={selectedPreference}
        setSelected={setBootableVolumeField('labels', DEFAULT_PREFERENCE_LABEL)}
        options={preferencesNames}
        groupVersionKind={VirtualMachineClusterPreferenceModelGroupVersionKind}
        optionLabelText={t('preference')}
      />
    </FormGroup>
  );
};

export default PreferenceSelect;
