import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { diskReducerActions, DiskReducerActionType } from '../state/actions';

type NameFormFieldProps = {
  dispatchDiskState: React.Dispatch<DiskReducerActionType>;
  objName: string;
};

const NameFormField: React.FC<NameFormFieldProps> = ({ dispatchDiskState, objName }) => {
  const { t } = useKubevirtTranslation();

  const handleChange = React.useCallback(
    (value: string, event: React.FormEvent<HTMLInputElement>) => {
      event.preventDefault();
      dispatchDiskState({ payload: value, type: diskReducerActions.SET_DISK_NAME });
    },
    [dispatchDiskState],
  );

  React.useEffect(() => {
    // explicit check for null to check if the field is empty by initialState
    if (objName === null) {
      dispatchDiskState({
        payload: generatePrettyName('disk'),
        type: diskReducerActions.SET_DISK_NAME,
      });
    }
  }, [dispatchDiskState, objName]);

  return (
    <FormGroup fieldId="name" isRequired label={t('Name')}>
      <TextInput id="name" onChange={handleChange} type="text" value={objName} />
    </FormGroup>
  );
};

export default NameFormField;
