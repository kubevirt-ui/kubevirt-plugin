import { type FC, useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { FormGroup, SelectOption } from '@patternfly/react-core';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import usePreferenceSelectOptions from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/components/PreferenceSelectMenu/hooks/usePreferenceSelectOptions/usePreferenceSelectOptions';
import { getPreferenceVersionName } from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/components/PreferenceSelectMenu/hooks/usePreferenceSelectOptions/utils/utils';
import { resetBootableVolumeFields } from '@virtualmachines/wizard/utils/utils';

import './PreferenceSelectMenu.scss';

const PreferenceSelectMenu: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control, setValue } = useVMWizardForm();
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
          name="instanceType.guestOperatingSystem"
          render={({ field: { onChange, value } }) => {
            const displayName =
              value?.displayName ?? (value?.name ? getPreferenceVersionName(value.name) : '');

            return (
              <FormPFSelect
                className="pf-v6-u-mt-md"
                isDisabled={noPreferences}
                onSelect={(_event, selectedValue) => {
                  onChange(selectedValue as PreferenceOption);
                  resetBootableVolumeFields(setValue);
                }}
                placeholder={placeholderText}
                selected={displayName}
                selectedLabel={displayName || placeholderText}
                toggleProps={{ isFullWidth: true }}
              >
                {preferences?.map((pref) => (
                  <SelectOption key={pref.name} value={pref}>
                    {pref.displayName ?? getPreferenceVersionName(pref.name)}
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
