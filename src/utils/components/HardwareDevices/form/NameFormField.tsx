import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, GridItem, TextInput } from '@patternfly/react-core';

type NameFormFieldProps = {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  index: number;
};

const NameFormField: React.FC<NameFormFieldProps> = ({ name, setName, index }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <GridItem span={5}>
        <FormGroup label={!index && t('Name')} fieldId="name" isRequired>
          <TextInput type="text" value={name} onChange={setName} id="name" />
        </FormGroup>
      </GridItem>
    </>
  );
};
export default NameFormField;
