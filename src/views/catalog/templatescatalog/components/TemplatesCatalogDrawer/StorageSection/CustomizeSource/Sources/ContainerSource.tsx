import React, { FC, FormEventHandler } from 'react';
import { useFormContext } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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

  const validated = errors?.[`${testId}-containerImage`]
    ? ValidatedOptions.error
    : ValidatedOptions.default;

  return (
    <FormGroup
      className="disk-source-form-group"
      fieldId={`${testId}-${selectedSourceType}`}
      isRequired
      label={t('Container Image')}
    >
      <FormTextInput
        {...register(`${testId}-containerImage`, { required: true })}
        aria-label={t('Container Image')}
        data-test-id={`${testId}-container-source-input`}
        id={`${testId}-${selectedSourceType}`}
        onChange={onInputValueChange}
        type="text"
        validated={validated}
      />
      <FormGroupHelperText validated={validated}>
        {errors?.[`${testId}-containerImage`]
          ? t('This field is required')
          : registrySourceHelperText}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default ContainerSource;
