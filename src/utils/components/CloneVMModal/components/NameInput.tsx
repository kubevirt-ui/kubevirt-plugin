import React, { FC, FormEvent, useEffect, useState } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getDNS1123LabelError } from '@kubevirt-utils/utils/validation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

type NameInputProps = {
  autoFocus?: boolean;
  name: string;
  setIsValid: (valid: boolean) => void;
  setName: (value: string) => void;
};

const NameInput: FC<NameInputProps> = ({ autoFocus, name, setIsValid, setName }) => {
  const { t } = useKubevirtTranslation();
  const [hasInteracted, setHasInteracted] = useState(false);

  const errorFn = getDNS1123LabelError(name);
  const errorText = errorFn?.(t);

  useEffect(() => {
    setIsValid(!errorText);
  }, [errorText, setIsValid]);

  const handleChange = (_event: FormEvent<HTMLInputElement>, value: string) => {
    if (!hasInteracted) setHasInteracted(true);
    setName(value);
  };

  return (
    <FormGroup fieldId="clone-name" isRequired label={t('Name')}>
      <TextInput
        autoFocus={autoFocus}
        id="clone-name"
        onChange={handleChange}
        type="text"
        validated={hasInteracted && errorText ? ValidatedOptions.error : ValidatedOptions.default}
        value={name}
      />
      {hasInteracted && errorText && (
        <FormGroupHelperText validated={ValidatedOptions.error}>{errorText}</FormGroupHelperText>
      )}
    </FormGroup>
  );
};

export default NameInput;
