import {
  type Dispatch,
  type FC,
  type FormEvent,
  type SetStateAction,
  useMemo,
  useState,
} from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import {
  FormGroup,
  Grid,
  GridItem,
  Stack,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import { SimpleSelect, type SimpleSelectOption } from '@patternfly/react-templates';

import { TimeoutUnits } from '../../../../views/virtualmachines/details/tabs/snapshots/utils/consts';
import { validateSnapshotTimeout } from '../../../../views/virtualmachines/details/tabs/snapshots/utils/helpers';

type SnapshotTimeoutFormFieldProps = {
  setIsError: Dispatch<SetStateAction<boolean>>;
  setSnapshotTimeout: Dispatch<SetStateAction<string>>;
  setSnapshotTimeoutUnit: Dispatch<SetStateAction<TimeoutUnits>>;
  snapshotTimeout: string;
  snapshotTimeoutUnit: TimeoutUnits;
};

const SnapshotTimeoutFormField: FC<SnapshotTimeoutFormFieldProps> = ({
  setIsError,
  setSnapshotTimeout,
  setSnapshotTimeoutUnit,
  snapshotTimeout,
  snapshotTimeoutUnit,
}) => {
  const { t } = useKubevirtTranslation();

  const [timeoutError, setTimeoutError] = useState(undefined);

  const handleTimeoutChange = (_event: FormEvent<HTMLInputElement>, value: string): void => {
    const error = validateSnapshotTimeout(t, value);
    setIsError(!!error);
    setTimeoutError(error);
    setSnapshotTimeout(value);
  };

  const timeoutUnitOptions = useMemo<SimpleSelectOption[]>(
    () =>
      Object.entries(TimeoutUnits).map(([key, value]) => ({
        content: `${key} (${value})`,
        selected: value === snapshotTimeoutUnit,
        value,
      })),
    [snapshotTimeoutUnit],
  );

  const validated = timeoutError ? ValidatedOptions.error : ValidatedOptions.default;

  return (
    <FormGroup
      fieldId="timeout"
      label={t('Timeout')}
      labelHelp={
        <HelpTextIcon
          bodyContent={(hide) => (
            <PopoverContentWithLightspeedButton
              content={
                <Stack hasGutter>
                  <span>
                    {t(
                      'This time represents the maximum duration we permit the VM snapshot to take. In case we pass this timeout we mark this snapshot as failed.',
                    )}
                  </span>
                  <span>{t('Defaults to 5 minutes')}</span>
                </Stack>
              }
              hide={hide}
              promptType={OLSPromptType.SNAPSHOT_TIMEOUT}
            />
          )}
        />
      }
    >
      <Grid hasGutter>
        <GridItem span={8}>
          <TextInput
            id="timeout"
            inputMode="numeric"
            onChange={handleTimeoutChange}
            type="text"
            validated={validated}
            value={snapshotTimeout}
          />
        </GridItem>
        <GridItem span={4}>
          <SimpleSelect
            id="timeout-unit"
            initialOptions={timeoutUnitOptions}
            onSelect={(_event, value: TimeoutUnits) => setSnapshotTimeoutUnit(value)}
            toggleProps={{ 'aria-label': t('Timeout unit') }}
          />
        </GridItem>
      </Grid>
      <FormGroupHelperText validated={validated}>{timeoutError}</FormGroupHelperText>
    </FormGroup>
  );
};

export default SnapshotTimeoutFormField;
