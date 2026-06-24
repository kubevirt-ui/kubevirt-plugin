import React, { FC, FormEvent } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

type NameInputProps = {
  autoFocus?: boolean;
  errorText: string | undefined;
  name: string;
  setName: (value: string) => void;
  validated: ValidatedOptions;
};

const NameInput: FC<NameInputProps> = ({ autoFocus, errorText, name, setName, validated }) => {
  const { t } = useKubevirtTranslation();

  const handleChange = (_event: FormEvent<HTMLInputElement>, value: string) => {
    setName(value);
  };

  return (
    <FormGroup fieldId="clone-name" isRequired label={t('Name')}>
      <TextInput
        autoFocus={autoFocus}
        id="clone-name"
        onChange={handleChange}
        type="text"
        validated={validated}
        value={name}
      />
      {errorText && <FormGroupHelperText validated={validated}>{errorText}</FormGroupHelperText>}
    </FormGroup>
  );
};

export default NameInput;
