import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

type DescriptionFieldProps = {
  description: string;
  setDescription: (description: string) => void;
};

const DescriptionField: FC<DescriptionFieldProps> = ({ description, setDescription }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup label={t('Description')}>
      <TextInput
        data-test="adv-search-vm-description"
        onChange={(_, value) => setDescription(value)}
        type="text"
        value={description}
      />
    </FormGroup>
  );
};

export default DescriptionField;
