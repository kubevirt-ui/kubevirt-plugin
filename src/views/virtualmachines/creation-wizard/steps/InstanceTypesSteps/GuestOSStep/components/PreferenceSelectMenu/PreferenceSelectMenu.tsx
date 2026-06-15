import React, { FC } from 'react';

import { PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { FormGroup, SelectOption } from '@patternfly/react-core';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard/state/instance-type-vm-store/useInstanceTypeVMStore';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import usePreferenceSelectOptions from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/components/PreferenceSelectMenu/hooks/usePreferenceSelectOptions/usePreferenceSelectOptions';

import './PreferenceSelectMenu.scss';

const PreferenceSelectMenu: FC = () => {
  const { t } = useKubevirtTranslation();
  const { cluster, project } = useVMWizardStore();
  const { operatingSystemType, preference, setPreference } = useInstanceTypeVMStore();

  const { preferences, preferencesLoaded } = usePreferenceSelectOptions(
    project,
    cluster,
    operatingSystemType,
  );

  const noPreferences = isEmpty(preferences);
  const placeholderText = noPreferences
    ? t('No guest operating system types available')
    : t('Select guest operating system type');

  return (
    <FormGroup
      className="preference-select-menu"
      fieldId="preference-select"
      label={t('Guest operating system type')}
    >
      {!preferencesLoaded ? (
        <Loading />
      ) : (
        <FormPFSelect
          onSelect={(_, value) => {
            setPreference(value as PreferenceOption);
          }}
          className="pf-v6-u-mt-md"
          isDisabled={noPreferences}
          placeholder={placeholderText}
          selected={preference?.name || ''}
          selectedLabel={preference?.name || placeholderText}
          toggleProps={{ isFullWidth: true }}
        >
          {preferences.map((pref) => (
            <SelectOption key={pref.name} value={pref}>
              {pref.name}
            </SelectOption>
          ))}
        </FormPFSelect>
      )}
    </FormGroup>
  );
};

export default PreferenceSelectMenu;
