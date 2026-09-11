import { type FC } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

type GatewayFormGroupProps = {
  errorMessage: string;
  fieldId: string;
  isValid: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
};

const GatewayFormGroup: FC<GatewayFormGroupProps> = ({
  errorMessage,
  fieldId,
  isValid,
  label,
  onChange,
  value,
}) => (
  <FormGroup className="kv-cloudint-advanced-tab--validation-text" fieldId={fieldId} label={label}>
    <TextInput
      id={fieldId}
      onChange={(_event, inputValue) => onChange(inputValue)}
      type="text"
      validated={isValid ? ValidatedOptions.default : ValidatedOptions.warning}
      value={value ?? ''}
    />
    {!isValid && (
      <FormGroupHelperText validated={ValidatedOptions.warning}>{errorMessage}</FormGroupHelperText>
    )}
  </FormGroup>
);

export default GatewayFormGroup;
