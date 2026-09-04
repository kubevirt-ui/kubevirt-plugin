import classNames from 'classnames';
import React, { type FC } from 'react';

import { type TemplateParameter } from '@kubevirt-ui-ext/kubevirt-api/console';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { FormPasswordInput } from '@kubevirt-utils/components/FormPasswordInput/FormPasswordInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getFieldRequiredMessage } from '@kubevirt-utils/utils/validation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';
import { isPasswordParameter } from '@templates/details/tabs/parameters/utils';

import { getPasswordParameterValueError } from '../utils/utils';

type FieldGroupProps = {
  className?: string;
  field: TemplateParameter;
  isDisabled?: boolean;
  onChange?: (name: string, value: string) => void;
  showError?: boolean;
};

const FieldGroup: FC<FieldGroupProps> = ({
  className,
  field,
  isDisabled = false,
  onChange,
  showError,
}) => {
  const { t } = useKubevirtTranslation();
  const { description, displayName, from, name, required, value } = field;
  const isPasswordParameterField = isPasswordParameter(name);

  const validated = showError ? ValidatedOptions.error : ValidatedOptions.default;
  const passwordValidationErrorMessage = getPasswordParameterValueError(t, value ?? '', from ?? '');
  const requiredErrorMessage = isEmpty(value) ? getFieldRequiredMessage(t) : undefined;
  const validationErrorMessage = isPasswordParameterField
    ? passwordValidationErrorMessage
    : requiredErrorMessage;

  const fieldId = `vm-customize-${name}`;

  const onFieldChange = (newValue: string): void => {
    onChange?.(name, newValue);
  };

  return (
    <FormGroup
      className={classNames('field-group', className)}
      fieldId={fieldId}
      isRequired={required}
      label={displayName || name}
    >
      {isPasswordParameterField ? (
        <FormPasswordInput
          data-test={fieldId}
          id={fieldId}
          isDisabled={isDisabled}
          name={name}
          onChange={(event) => onFieldChange((event.target as HTMLInputElement).value)}
          validated={validated}
          value={value}
        />
      ) : (
        <TextInput
          data-test={fieldId}
          id={fieldId}
          isDisabled={isDisabled}
          isRequired={required}
          name={name}
          onChange={(_event, newValue: string) => onFieldChange(newValue)}
          type="text"
          validated={validated}
          value={value}
        />
      )}
      <FormGroupHelperText validated={validated}>
        {showError && validationErrorMessage ? validationErrorMessage : description}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default FieldGroup;
