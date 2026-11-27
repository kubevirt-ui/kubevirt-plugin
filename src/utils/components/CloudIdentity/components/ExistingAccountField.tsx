import { type FC } from 'react';
import { Controller } from 'react-hook-form';

import { type IoK8sApiCoreV1ServiceAccount } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { FormGroup, SelectOption } from '@patternfly/react-core';

import useFormContext from '../hooks/useFormContext';
import { type CloudIdentityProvider } from '../types/types';
import { isServiceAccountCompatibleWithProvider } from '../utils/serviceAccount';
import ExistingAccountFieldWrapper from './ExistingAccountFieldWrapper';

type ExistingAccountFieldProps = {
  canRead: boolean;
  error?: Error;
  isExistingUnavailable: boolean;
  loaded: boolean;
  provider: CloudIdentityProvider;
  serviceAccounts: IoK8sApiCoreV1ServiceAccount[];
};

const ExistingAccountField: FC<ExistingAccountFieldProps> = ({
  canRead,
  error,
  isExistingUnavailable,
  loaded,
  provider,
  serviceAccounts,
}) => {
  const { t } = useKubevirtTranslation();
  const { control } = useFormContext();

  return (
    <FormGroup
      fieldId="cloud-identity-existing-service-account"
      isRequired
      label={t('ServiceAccount name')}
    >
      <ExistingAccountFieldWrapper canRead={canRead} error={error} loaded={loaded}>
        <Controller
          control={control}
          name="existingServiceAccountName"
          render={({ field }) => (
            <FormPFSelect
              isDisabled={isExistingUnavailable}
              isLoading={!loaded}
              onSelect={(_event, value) => field.onChange(String(value))}
              placeholder={t('Select a ServiceAccount')}
              selected={field.value || undefined}
              toggleProps={{
                id: 'cloud-identity-existing-service-account',
              }}
            >
              {serviceAccounts.map((serviceAccount) => {
                const name = getName(serviceAccount) ?? '';
                const isIncompatible = !isServiceAccountCompatibleWithProvider(
                  serviceAccount,
                  provider,
                );
                return (
                  <SelectOption
                    description={
                      isIncompatible ? t('Currently associated; annotations are not valid') : ''
                    }
                    isDisabled={isIncompatible}
                    key={name}
                    value={name}
                  >
                    {name}
                  </SelectOption>
                );
              })}
            </FormPFSelect>
          )}
        />
      </ExistingAccountFieldWrapper>
    </FormGroup>
  );
};

export default ExistingAccountField;
