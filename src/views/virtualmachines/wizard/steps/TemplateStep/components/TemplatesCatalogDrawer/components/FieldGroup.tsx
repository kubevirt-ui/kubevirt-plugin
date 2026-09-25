import { type FC } from 'react';
import classNames from 'classnames';

import { type TemplateParameter } from '@kubevirt-ui-ext/kubevirt-api/console';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { FormPasswordInput } from '@kubevirt-utils/components/FormPasswordInput/FormPasswordInput';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';
import { isPasswordParameter } from '@templates/details/tabs/parameters/utils';

type FieldGroupProps = {
  className?: string;
  errorMessage?: string;
  field: TemplateParameter;
  isDisabled?: boolean;
  onChange?: (name: string, value: string) => void;
};

const FieldGroup: FC<FieldGroupProps> = ({
  className,
  errorMessage,
  field,
  isDisabled = false,
  onChange,
}) => {
  const { description, displayName, name, required, value } = field;
  const isPasswordParameterField = isPasswordParameter(name);

  const validated = errorMessage ? ValidatedOptions.error : ValidatedOptions.default;

  const fieldId = `vm-customize-${name}`;

  const onFieldChange = (newValue: string): void => {
    onChange?.(name, newValue);
  };

  return (
    <FormGroup
      className={classNames('field-group', className)}
      fieldId={fieldId}
      isRequired={required}
      label={displayName ?? name}
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
      <FormGroupHelperText validated={validated}>{errorMessage ?? description}</FormGroupHelperText>
    </FormGroup>
  );
};

export default FieldGroup;
