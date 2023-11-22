import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

type NameFormFieldProps = {
  objName: string;
  setObjName: React.Dispatch<React.SetStateAction<string>>;
};

const NameFormField: React.FC<NameFormFieldProps> = ({ objName, setObjName }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup fieldId="name" isRequired label={t('Name')}>
      <TextInput id="name" onChange={setObjName} type="text" value={objName} />
    </FormGroup>
  );
};

export default NameFormField;
