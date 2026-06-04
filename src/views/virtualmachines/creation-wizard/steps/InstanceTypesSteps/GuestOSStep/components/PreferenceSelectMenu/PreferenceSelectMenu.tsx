import React, { FC } from 'react';

import { PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/utils';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, SelectOption } from '@patternfly/react-core';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard/state/instance-type-vm-store/useInstanceTypeVMStore';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import usePreferenceSelectOptions from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/components/PreferenceSelectMenu/hooks/usePreferenceSelectOptions/usePreferenceSelectOptions';

import './PreferenceSelectMenu.scss';

const PreferenceSelectMenu: FC = () => {
  const { t } = useKubevirtTranslation();
  const { cluster, project } = useVMWizardStore();
  const { operatingSystemType, preference, setPreference } = useInstanceTypeVMStore();

  const { preferences } = usePreferenceSelectOptions(project, cluster, operatingSystemType);

  return (
    <FormGroup
      className="preference-select-menu"
      fieldId="preference-select"
      label={t('Guest operating system type')}
    >
      <FormPFSelect
        onSelect={(_, value) => {
          setPreference(value as PreferenceOption);
        }}
        className="pf-v6-u-mt-md"
        placeholder={t('Select guest operating system type')}
        selected={preference?.name || ''}
        selectedLabel={preference?.name || t('Select guest operating system type')}
        toggleProps={{ isFullWidth: true }}
      >
        {preferences.map((pref) => (
          <SelectOption key={pref.name} value={pref}>
            {pref.name}
          </SelectOption>
        ))}
      </FormPFSelect>
    </FormGroup>
  );
};

export default PreferenceSelectMenu;
