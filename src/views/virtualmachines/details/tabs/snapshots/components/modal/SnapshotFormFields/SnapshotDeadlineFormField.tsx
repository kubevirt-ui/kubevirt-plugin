import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import {
  FormGroup,
  FormSelect,
  FormSelectOption,
  Grid,
  GridItem,
  TextInput,
} from '@patternfly/react-core';

import { deadlineUnits } from '../../../utils/consts';
import { validateSnapshotDeadline } from '../../../utils/helpers';

type SnapshotDeadlineFormFieldProps = {
  deadline: string;
  deadlineUnit: string;
  setDeadline: React.Dispatch<React.SetStateAction<string>>;
  setDeadlineUnit: React.Dispatch<React.SetStateAction<string>>;
  setIsError: React.Dispatch<React.SetStateAction<boolean>>;
};

const SnapshotDeadlineFormField: React.FC<SnapshotDeadlineFormFieldProps> = ({
  deadline,
  deadlineUnit,
  setDeadline,
  setDeadlineUnit,
  setIsError,
}) => {
  const { t } = useKubevirtTranslation();

  const [deadlineError, setDeadlineError] = React.useState(undefined);

  const handleDeadlineChange = (value: string, event: React.FormEvent<HTMLInputElement>) => {
    event.preventDefault();
    const error = validateSnapshotDeadline(value, t);
    setIsError(!!error);
    setDeadlineError(error);
    setDeadline(value);
  };

  const handleDeadlineUnitChange = (
    value: deadlineUnits,
    event: React.FormEvent<HTMLSelectElement>,
  ) => {
    event.preventDefault();
    setDeadlineUnit(value);
  };

  return (
    <FormGroup
      fieldId="deadline"
      helperTextInvalid={deadlineError}
      helperTextInvalidIcon={deadlineError && <RedExclamationCircleIcon title="Error" />}
      label={t('Deadline')}
      validated={deadlineError ? 'error' : 'default'}
    >
      <Grid hasGutter>
        <GridItem span={8}>
          <TextInput id="deadline" onChange={handleDeadlineChange} type="text" value={deadline} />
        </GridItem>
        <GridItem span={4}>
          <FormSelect id="deadline-unit" onChange={handleDeadlineUnitChange} value={deadlineUnit}>
            {Object.entries(deadlineUnits).map(([key, value]) => (
              <FormSelectOption key={key} label={`${key} (${value})`} value={value} />
            ))}
          </FormSelect>
        </GridItem>
      </Grid>
    </FormGroup>
  );
};

export default SnapshotDeadlineFormField;
