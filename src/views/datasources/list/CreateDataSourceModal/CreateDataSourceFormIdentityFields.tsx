import React, { type FC } from 'react';
import { type FieldError, type UseFormRegister } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getFieldRequiredMessage } from '@kubevirt-utils/utils/validation';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

import { type CreateDataSourceModalFormType } from './CreateDataSourceModal';

type CreateDataSourceFormIdentityFieldsProps = {
  errors: {
    [Property in keyof CreateDataSourceModalFormType]?: FieldError;
  };
  register: UseFormRegister<CreateDataSourceModalFormType>;
};

const CreateDataSourceFormIdentityFields: FC<CreateDataSourceFormIdentityFieldsProps> = ({
  errors,
  register,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <FormGroup fieldId="datasource-create-name" isRequired label={t('Name')}>
        <FormTextInput
          {...register('name', { required: true })}
          aria-label={t('Name')}
          id="datasource-create-name"
          type="text"
          validated={errors?.['name'] ? ValidatedOptions.error : ValidatedOptions.default}
        />
        <FormGroupHelperText
          validated={errors?.['name'] ? ValidatedOptions.error : ValidatedOptions.default}
        >
          {errors?.['name'] && getFieldRequiredMessage(t)}
        </FormGroupHelperText>
      </FormGroup>
      <FormGroup
        aria-label={t('Registry URL')}
        fieldId="datasource-create-source-url"
        isRequired
        label={t('Registry URL')}
      >
        <FormTextInput
          {...register('url', { required: true })}
          aria-label={t('Registry URL')}
          data-test={'datasource-create-source-url'}
          id={'datasource-create-source-url'}
          type="text"
          validated={errors?.['url'] ? ValidatedOptions.error : ValidatedOptions.default}
        />
        <FormGroupHelperText
          validated={errors?.['url'] ? ValidatedOptions.error : ValidatedOptions.default}
        >
          {errors?.['url']
            ? getFieldRequiredMessage(t)
            : t('Example: {{exampleURL}}', {
                exampleURL: 'quay.io/containerdisks/centos:7-2009',
              })}
        </FormGroupHelperText>
      </FormGroup>
    </>
  );
};

export default CreateDataSourceFormIdentityFields;
