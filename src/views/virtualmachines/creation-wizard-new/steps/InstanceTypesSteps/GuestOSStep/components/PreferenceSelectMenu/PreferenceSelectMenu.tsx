import React, { FC, useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { FormGroup, SelectOption } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';
import usePreferenceSelectOptions from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/GuestOSStep/components/PreferenceSelectMenu/hooks/usePreferenceSelectOptions/usePreferenceSelectOptions';

import './PreferenceSelectMenu.scss';

const PreferenceSelectMenu: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control } = useVMWizard();
  const [cluster, project, operatingSystemType] = useWatch({
    control,
    name: [
      CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER,
      CREATE_VM_FORM_FIELDS_VM_DATA.PROJECT,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.OPERATING_SYSTEM_TYPE,
    ],
  });

  const { preferences, preferencesLoaded } = usePreferenceSelectOptions(
    project,
    cluster,
    operatingSystemType,
  );

  const { noPreferences, placeholderText } = useMemo(() => {
    const noPreferencesExists = isEmpty(preferences);
    return {
      noPreferences: noPreferencesExists,
      placeholderText: noPreferencesExists
        ? t('No guest operating system types available')
        : t('Select guest operating system type'),
    };
  }, [preferences, t]);

  return (
    <FormGroup
      className="preference-select-menu"
      fieldId="preference-select"
      label={t('Guest operating system type')}
    >
      {!preferencesLoaded ? (
        <Loading />
      ) : (
        <Controller
          render={({ field: { onChange, value } }) => {
            return (
              <FormPFSelect
                onSelect={(_, selectedValue) => {
                  onChange(selectedValue as PreferenceOption);
                }}
                className="pf-v6-u-mt-md"
                isDisabled={noPreferences}
                placeholder={placeholderText}
                selected={value?.name || ''}
                selectedLabel={value?.name || placeholderText}
                toggleProps={{ isFullWidth: true }}
              >
                {preferences?.map((pref) => (
                  <SelectOption key={pref.name} value={pref}>
                    {pref.name}
                  </SelectOption>
                ))}
              </FormPFSelect>
            );
          }}
          control={control}
          name={CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.PREFERENCE}
        />
      )}
    </FormGroup>
  );
};

export default PreferenceSelectMenu;
