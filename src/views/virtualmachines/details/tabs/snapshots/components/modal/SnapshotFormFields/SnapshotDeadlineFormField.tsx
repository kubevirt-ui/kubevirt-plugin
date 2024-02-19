import React, { Dispatch, FC, FormEvent, SetStateAction, useState } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  FormGroup,
  FormSelect,
  FormSelectOption,
  Grid,
  GridItem,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';

import { deadlineUnits } from '../../../utils/consts';
import { validateSnapshotDeadline } from '../../../utils/helpers';

type SnapshotDeadlineFormFieldProps = {
  deadline: string;
  deadlineUnit: string;
  setDeadline: Dispatch<SetStateAction<string>>;
  setDeadlineUnit: Dispatch<SetStateAction<string>>;
  setIsError: Dispatch<SetStateAction<boolean>>;
};

const SnapshotDeadlineFormField: FC<SnapshotDeadlineFormFieldProps> = ({
  deadline,
  deadlineUnit,
  setDeadline,
  setDeadlineUnit,
  setIsError,
}) => {
  const { t } = useKubevirtTranslation();

  const [deadlineError, setDeadlineError] = useState(undefined);

  const handleDeadlineChange = (value: string, event: FormEvent<HTMLInputElement>) => {
    event.preventDefault();
    const error = validateSnapshotDeadline(value);
    setIsError(!!error);
    setDeadlineError(error);
    setDeadline(value);
  };

  const handleDeadlineUnitChange = (value: deadlineUnits, event: FormEvent<HTMLSelectElement>) => {
    event.preventDefault();
    setDeadlineUnit(value);
  };

  const validated = deadlineError ? ValidatedOptions.error : ValidatedOptions.default;

  return (
    <FormGroup fieldId="deadline" label={t('Deadline')}>
      <Grid hasGutter>
        <GridItem span={8}>
          <TextInput
            id="deadline"
            onChange={(event, value: string) => handleDeadlineChange(value, event)}
            type="text"
            value={deadline}
          />
        </GridItem>
        <GridItem span={4}>
          <FormSelect
            id="deadline-unit"
            onChange={(event, value: deadlineUnits) => handleDeadlineUnitChange(value, event)}
            value={deadlineUnit}
          >
            {Object.entries(deadlineUnits).map(([key, value]) => (
              <FormSelectOption key={key} label={`${key} (${value})`} value={value} />
            ))}
          </FormSelect>
        </GridItem>
      </Grid>
      <FormGroupHelperText validated={validated}>{deadlineError}</FormGroupHelperText>
    </FormGroup>
  );
};

export default SnapshotDeadlineFormField;
