import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { diskReducerActions } from '../reducer/actions';

type NameFormFieldProps = {
  objName: string;
  dispatch: React.Dispatch<any>;
};

const NameFormField: React.FC<NameFormFieldProps> = ({ objName, dispatch }) => {
  const { t } = useKubevirtTranslation();

  const handleChange = React.useCallback(
    (value: string, event: React.FormEvent<HTMLInputElement>) => {
      event.preventDefault();
      dispatch({ type: diskReducerActions.SET_DISK_MAME, payload: value });
    },
    [dispatch],
  );
  return (
    <FormGroup label={t('Name')} fieldId="name" isRequired>
      <TextInput id="name" type="text" value={objName} onChange={handleChange} />
    </FormGroup>
  );
};

export default NameFormField;
