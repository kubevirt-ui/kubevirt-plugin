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
    <FormGroup label={t('Name')} fieldId="name" isRequired>
      <TextInput type="text" value={objName} onChange={setObjName} id="name" />
    </FormGroup>
  );
};

export default NameFormField;
