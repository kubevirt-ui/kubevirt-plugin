import { type FC, useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { FormGroup, SelectOption } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import usePreferenceSelectOptions from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/components/PreferenceSelectMenu/hooks/usePreferenceSelectOptions/usePreferenceSelectOptions';
import { resetBootableVolumeFields } from '@virtualmachines/wizard/utils/utils';

import './PreferenceSelectMenu.scss';

const PreferenceSelectMenu: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control, getValues, setValue } = useVMWizard();
  const [cluster, project, operatingSystemType] = useWatch({
    control,
    name: ['deployment.cluster', 'deployment.project', 'instanceType.operatingSystem'],
  });

  const { isPreferencesLoaded, preferences } = usePreferenceSelectOptions(
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
      {!isPreferencesLoaded ? (
        <Loading />
      ) : (
        <Controller
          control={control}
          name="instanceType.preference"
          render={({ field: { onChange, value } }) => {
            return (
              <FormPFSelect
                className="pf-v6-u-mt-md"
                isDisabled={noPreferences}
                onSelect={(_event, selectedValue) => {
                  onChange(selectedValue as PreferenceOption);
                  resetBootableVolumeFields(getValues, setValue);
                }}
                placeholder={placeholderText}
                selected={(value?.name as string) || ''}
                selectedLabel={(value?.name as string) || placeholderText}
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
        />
      )}
    </FormGroup>
  );
};

export default PreferenceSelectMenu;
