import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

type NameFormFieldProps = {
  isDisabled?: boolean;
  objName: string;
  setObjName: Dispatch<SetStateAction<string>>;
};

const NameFormField: FC<NameFormFieldProps> = ({ isDisabled, objName, setObjName }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup fieldId="name" isRequired label={t('Name')}>
      <TextInput
        id="name"
        isDisabled={isDisabled}
        onChange={setObjName}
        type="text"
        value={objName}
      />
    </FormGroup>
  );
};

export default NameFormField;
