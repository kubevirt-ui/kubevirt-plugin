import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

type DescriptionInputProps = {
  description: string;
  placeholder?: string;
  setDescription: Dispatch<SetStateAction<string>>;
};

const DescriptionInput: FC<DescriptionInputProps> = ({
  description,
  placeholder,
  setDescription,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <FormGroup fieldId="description" label={t('Description')}>
      <TextInput
        id="description"
        onChange={(_, value: string) => setDescription(value)}
        placeholder={placeholder}
        type="text"
        value={description}
      />
    </FormGroup>
  );
};

export default DescriptionInput;
