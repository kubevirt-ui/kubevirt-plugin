import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { validateSnapshotName } from '../../../utils/helpers';

type SnapshotNameFormFieldProps = {
  snapshotName: string;
  setSnapshotName: React.Dispatch<React.SetStateAction<string>>;
  usedNames: string[];
  setIsError: React.Dispatch<React.SetStateAction<boolean>>;
};

const SnapshotNameFormField: React.FC<SnapshotNameFormFieldProps> = ({
  snapshotName,
  setSnapshotName,
  usedNames,
  setIsError,
}) => {
  const { t } = useKubevirtTranslation();

  const [snapshotNameError, setSnapshotNameError] = React.useState(undefined);

  const handleNameChange = (value: string, event: React.FormEvent<HTMLInputElement>) => {
    event.preventDefault();
    const error = validateSnapshotName(value, usedNames, t);
    setIsError(error !== undefined);
    setSnapshotNameError(error);
    setSnapshotName(value);
  };

  return (
    <FormGroup
      label={t('Name')}
      fieldId="name"
      isRequired
      helperTextInvalid={snapshotNameError}
      helperTextInvalidIcon={snapshotNameError && <RedExclamationCircleIcon title="Error" />}
      validated={snapshotNameError ? 'error' : 'default'}
    >
      <TextInput type="text" value={snapshotName} onChange={handleNameChange} />
    </FormGroup>
  );
};

export default SnapshotNameFormField;
