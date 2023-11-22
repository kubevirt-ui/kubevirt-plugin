import React, { FC, FormEventHandler } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

type ContainerSourceProps = {
  onInputValueChange: FormEventHandler<HTMLInputElement>;
  registrySourceHelperText: string;
  selectedSourceType: string;
  testId: string;
};

const ContainerSource: FC<ContainerSourceProps> = ({
  onInputValueChange,
  registrySourceHelperText,
  selectedSourceType,
  testId,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    formState: { errors },
    register,
  } = useFormContext();

  return (
    <FormGroup
      validated={
        errors?.[`${testId}-containerImage`] ? ValidatedOptions.error : ValidatedOptions.default
      }
      className="disk-source-form-group"
      fieldId={`${testId}-${selectedSourceType}`}
      helperText={registrySourceHelperText}
      helperTextInvalid={t('This field is required')}
      helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
      isRequired
      label={t('Container Image')}
    >
      <FormTextInput
        {...register(`${testId}-containerImage`, { required: true })}
        validated={
          errors?.[`${testId}-containerImage`] ? ValidatedOptions.error : ValidatedOptions.default
        }
        aria-label={t('Container Image')}
        data-test-id={`${testId}-container-source-input`}
        id={`${testId}-${selectedSourceType}`}
        onChange={onInputValueChange}
        type="text"
      />
    </FormGroup>
  );
};

export default ContainerSource;
