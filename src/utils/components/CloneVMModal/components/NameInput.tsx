import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

type NameInputProps = {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
};

const NameInput: React.FC<NameInputProps> = ({ name, setName }) => {
  const { t } = useKubevirtTranslation();
  return (
    <FormGroup fieldId="name" isRequired label={t('Name')}>
      <TextInput id="name" onChange={setName} type="text" value={name} />
    </FormGroup>
  );
};

export default NameInput;
