import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';

import { NumberInput, Skeleton, Title } from '@patternfly/react-core';

type MigrationNumberInputProps = {
  inputName: string;
  minValue: number;
  setValue: Dispatch<SetStateAction<number>>;
  title: string;
  updateValue: (value: number) => void;
  value: number;
};

const MigrationNumberInput: FC<MigrationNumberInputProps> = ({
  inputName,
  minValue,
  setValue,
  title,
  updateValue,
  value,
}) => (
  <>
    <Title headingLevel="h6" size="md">
      {title}
    </Title>
    {isNaN(value) ? (
      <Skeleton height="33px" width="140px" />
    ) : (
      <NumberInput
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const newValue = Number(event.target.value);
          newValue >= minValue &&
            setValue(() => {
              updateValue(newValue);
              return newValue;
            });
        }}
        onMinus={() =>
          setValue((currentValue) => {
            const newValue = currentValue - 1;
            if (newValue >= minValue) {
              updateValue(newValue);
              return newValue;
            }
            return currentValue;
          })
        }
        onPlus={() =>
          setValue((currentValue) => {
            const newValue = currentValue + 1;
            updateValue(newValue);
            return newValue;
          })
        }
        inputName={inputName}
        min={minValue}
        value={value}
      />
    )}
  </>
);

export default MigrationNumberInput;
