import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextArea } from '@patternfly/react-core';

type DescriptionInputProps = {
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
};

const DescriptionInput: React.FC<DescriptionInputProps> = ({ description, setDescription }) => {
  const { t } = useKubevirtTranslation();
  return (
    <FormGroup label={t('Description')} fieldId="description">
      <TextArea type="text" value={description} onChange={setDescription} id="description" />
    </FormGroup>
  );
};

export default DescriptionInput;
