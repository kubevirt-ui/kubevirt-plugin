import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, GridItem, TextInput } from '@patternfly/react-core';

type NameFormFieldProps = {
  index: number;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
};

const NameFormField: FC<NameFormFieldProps> = ({ index, name, setName }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <GridItem span={5}>
        <FormGroup fieldId="name" label={!index && t('Name')}>
          <TextInput
            id="name"
            onChange={(_, value: string) => setName(value)}
            type="text"
            value={name}
          />
        </FormGroup>
      </GridItem>
    </>
  );
};
export default NameFormField;
