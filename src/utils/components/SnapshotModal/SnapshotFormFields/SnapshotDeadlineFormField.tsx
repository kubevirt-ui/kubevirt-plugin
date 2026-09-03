import React, {
  type Dispatch,
  type FC,
  type FormEvent,
  type SetStateAction,
  useState,
} from 'react';

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

import { deadlineUnits } from '../../../../views/virtualmachines/details/tabs/snapshots/utils/consts';
import { validateSnapshotDeadline } from '../../../../views/virtualmachines/details/tabs/snapshots/utils/helpers';

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

  const handleDeadlineChange = (_event: FormEvent<HTMLInputElement>, value: string): void => {
    const error = validateSnapshotDeadline(t, value);
    setIsError(!!error);
    setDeadlineError(error);
    setDeadline(value);
  };

  const handleDeadlineUnitChange = (
    _event: FormEvent<HTMLSelectElement>,
    value: deadlineUnits,
  ): void => {
    setDeadlineUnit(value);
  };

  const validated = deadlineError ? ValidatedOptions.error : ValidatedOptions.default;

  return (
    <FormGroup fieldId="deadline" label={t('Deadline')}>
      <Grid hasGutter>
        <GridItem span={8}>
          <TextInput
            id="deadline"
            inputMode="numeric"
            onChange={handleDeadlineChange}
            type="text"
            validated={validated}
            value={deadline}
          />
        </GridItem>
        <GridItem span={4}>
          <FormSelect id="deadline-unit" onChange={handleDeadlineUnitChange} value={deadlineUnit}>
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
