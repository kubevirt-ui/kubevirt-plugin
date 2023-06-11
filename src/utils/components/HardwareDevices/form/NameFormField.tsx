import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, GridItem, TextInput } from '@patternfly/react-core';

type NameFormFieldProps = {
  index: number;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
};

const NameFormField: React.FC<NameFormFieldProps> = ({ index, name, setName }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <GridItem span={5}>
        <FormGroup fieldId="name" isRequired label={!index && t('Name')}>
          <TextInput id="name" onChange={setName} type="text" value={name} />
        </FormGroup>
      </GridItem>
    </>
  );
};
export default NameFormField;
