import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

type NameInputProps = {
  autoFocus?: boolean;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
};

const NameInput: FC<NameInputProps> = ({ autoFocus, name, setName }) => {
  const { t } = useKubevirtTranslation();
  return (
    <FormGroup fieldId="name" isRequired label={t('Name')}>
      <TextInput
        autoFocus={autoFocus}
        id="name"
        onChange={(_, value: string) => setName(value)}
        type="text"
        value={name}
      />
    </FormGroup>
  );
};

export default NameInput;
