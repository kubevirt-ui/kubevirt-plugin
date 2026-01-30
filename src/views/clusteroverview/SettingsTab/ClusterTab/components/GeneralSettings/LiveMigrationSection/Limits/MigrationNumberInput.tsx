import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { NumberInput, PopoverPosition, Skeleton, Title } from '@patternfly/react-core';

type MigrationNumberInputProps = {
  inputName: string;
  labelHelp: string;
  minValue: number;
  setValue: Dispatch<SetStateAction<number>>;
  title: string;
  updateValue: (value: number) => void;
  value: number;
};

const MigrationNumberInput: FC<MigrationNumberInputProps> = ({
  inputName,
  labelHelp,
  minValue,
  setValue,
  title,
  updateValue,
  value,
}) => {
  return (
    <>
      <Title headingLevel="h6" size="md">
        {title}
        {labelHelp && (
          <HelpTextIcon
            bodyContent={labelHelp}
            helpIconClassName="pf-v6-u-ml-xs"
            position={PopoverPosition.right}
          />
        )}
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
};
export default MigrationNumberInput;
