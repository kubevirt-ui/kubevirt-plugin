import { type FC } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

import useFormContext from '../hooks/useFormContext';
import { type CloudIdentityProvider } from '../types/types';
import AWSFields from './AWSFields';

type NewAccountFieldsProps = { provider: CloudIdentityProvider };

const NewAccountFields: FC<NewAccountFieldsProps> = ({ provider }) => {
  const { t } = useKubevirtTranslation();
  const {
    formState: { errors },
    register,
  } = useFormContext();

  return (
    <>
      <FormGroup
        fieldId="cloud-identity-new-service-account"
        isRequired
        label={t('ServiceAccount name')}
      >
        <FormTextInput
          {...register('newServiceAccountName')}
          id="cloud-identity-new-service-account"
          isRequired
          type="text"
          validated={
            errors.newServiceAccountName ? ValidatedOptions.error : ValidatedOptions.default
          }
        />
        <FormGroupHelperText
          validated={errors.newServiceAccountName ? ValidatedOptions.error : undefined}
        >
          {errors.newServiceAccountName?.message}
        </FormGroupHelperText>
      </FormGroup>

      {provider === 'aws' && <AWSFields />}
    </>
  );
};

export default NewAccountFields;
