import React, { Dispatch, FCC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

type NameFormFieldProps = {
  isDisabled?: boolean;
  objName: string;
  setObjName: Dispatch<SetStateAction<string>>;
};

const NameFormField: FCC<NameFormFieldProps> = ({ isDisabled, objName, setObjName }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup fieldId="name" isRequired label={t('Name')}>
      <TextInput
        id="name"
        isDisabled={isDisabled}
        onChange={(_, value: string) => setObjName(value)}
        type="text"
        value={objName}
      />
    </FormGroup>
  );
};

export default NameFormField;
