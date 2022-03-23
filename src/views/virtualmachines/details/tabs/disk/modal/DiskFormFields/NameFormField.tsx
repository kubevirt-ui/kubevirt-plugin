import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { diskReducerActions } from '../state/actions';

import { generateDiskName } from './utils/helpers';

type NameFormFieldProps = {
  objName: string;
  dispatchDiskState: React.Dispatch<any>;
};

const NameFormField: React.FC<NameFormFieldProps> = ({ objName, dispatchDiskState }) => {
  const { t } = useKubevirtTranslation();

  const handleChange = React.useCallback(
    (value: string, event: React.FormEvent<HTMLInputElement>) => {
      event.preventDefault();
      dispatchDiskState({ type: diskReducerActions.SET_DISK_NAME, payload: value });
    },
    [dispatchDiskState],
  );

  React.useEffect(() => {
    // explicit check for null to check if the field is empty by initialState
    if (objName === null) {
      dispatchDiskState({ type: diskReducerActions.SET_DISK_NAME, payload: generateDiskName() });
    }
  }, [dispatchDiskState, objName]);

  return (
    <FormGroup label={t('Name')} fieldId="name" isRequired>
      <TextInput id="name" type="text" value={objName} onChange={handleChange} />
    </FormGroup>
  );
};

export default NameFormField;
