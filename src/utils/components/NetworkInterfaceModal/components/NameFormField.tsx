import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

type NameFormFieldProps = {
  objName: string;
  setObjName: Dispatch<SetStateAction<string>>;
  isDisabled?: boolean;
};

const NameFormField: FC<NameFormFieldProps> = ({ objName, setObjName, isDisabled }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup label={t('Name')} fieldId="name" isRequired>
      <TextInput
        type="text"
        value={objName}
        onChange={setObjName}
        id="name"
        isDisabled={isDisabled}
      />
    </FormGroup>
  );
};

export default NameFormField;
