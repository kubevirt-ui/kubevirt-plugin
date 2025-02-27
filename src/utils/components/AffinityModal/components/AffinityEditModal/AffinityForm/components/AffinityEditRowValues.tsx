import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  InputGroup,
  InputGroupItem,
  Label,
  LabelGroup,
  Stack,
  TextInput,
} from '@patternfly/react-core';

type AffinityEditRowValuesProps = {
  isHidden?: boolean;
  onClear?: () => void;
  onSelect?: (event, selection) => void;
  values: string[];
};

export const AffinityEditRowValues: FC<AffinityEditRowValuesProps> = ({
  isHidden,
  onClear,
  onSelect,
  values,
}) => {
  const { t } = useKubevirtTranslation();
  const [inputValue, setInputValue] = useState('');

  const onClose = (value: string) => {
    onSelect(null, value);
  };

  const onAdd = () => {
    onSelect(null, inputValue);
    setInputValue('');
  };

  const addingIsDisabled =
    !inputValue || values.some((val) => val.toLowerCase() === inputValue.toLowerCase());

  const textInputPlaceholder = t('Enter value');
  const labelsToShowCount = Number.MAX_VALUE; // always show all labels

  return isHidden ? null : (
    <Stack hasGutter>
      <LabelGroup isClosable numLabels={labelsToShowCount} onClick={onClear}>
        {values.map((value) => (
          <Label id={value} key={value} onClose={() => onClose(value)} variant="outline">
            {value}
          </Label>
        ))}
      </LabelGroup>
      <InputGroup>
        <InputGroupItem isFill>
          <TextInput
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !addingIsDisabled) {
                event.preventDefault();
                onAdd();
              }
            }}
            aria-label={textInputPlaceholder}
            onChange={(_event, value) => setInputValue(value)}
            placeholder={textInputPlaceholder}
            type="text"
            value={inputValue}
          />
        </InputGroupItem>
        <InputGroupItem>
          <Button isDisabled={addingIsDisabled} onClick={onAdd} variant="control">
            {t('Add')}
          </Button>
        </InputGroupItem>
      </InputGroup>
    </Stack>
  );
};
