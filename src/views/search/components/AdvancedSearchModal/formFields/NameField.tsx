import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

type NameFieldProps = {
  name: string;
  setName: (name: string) => void;
};

const NameField: FC<NameFieldProps> = ({ name, setName }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup label={t('Name')}>
      <TextInput
        data-test="adv-search-vm-name"
        onChange={(_, value) => setName(value)}
        type="text"
        value={name}
      />
    </FormGroup>
  );
};

export default NameField;
