import React, { FC, FormEvent, useEffect, useState } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getDNS1120LabelError } from '@kubevirt-utils/utils/validation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

type NameInputProps = {
  name: string;
  setIsValid: (valid: boolean) => void;
  setName: (value: string) => void;
};

const NameInput: FC<NameInputProps> = ({ name, setIsValid, setName }) => {
  const { t } = useKubevirtTranslation();
  const [hasInteracted, setHasInteracted] = useState(false);

  const errorFn = getDNS1120LabelError(name);
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
