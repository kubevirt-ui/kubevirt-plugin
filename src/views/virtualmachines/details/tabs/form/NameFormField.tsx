import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

type NameFormFieldProps = {
  objName: string;
  setObjName: Dispatch<SetStateAction<string>>;
};

const NameFormField: FC<NameFormFieldProps> = ({ objName, setObjName }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup fieldId="name" isRequired label={t('Name')}>
      <TextInput
        id="name"
        onChange={(_, name: string) => setObjName(name)}
        type="text"
        value={objName}
      />
    </FormGroup>
  );
};

export default NameFormField;
