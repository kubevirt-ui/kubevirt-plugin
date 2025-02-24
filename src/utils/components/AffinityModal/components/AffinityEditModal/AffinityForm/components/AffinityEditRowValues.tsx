import React from 'react';

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
  onClear?: () => void;
  onSelect?: (event, selection) => void;
  values: string[];
};

export const AffinityEditRowValues: React.FC<AffinityEditRowValuesProps> = ({
  onClear,
  onSelect,
  values,
}) => {
  const { t } = useKubevirtTranslation();
  const [inputValue, setInputValue] = React.useState('');

  const onClose = (value: string) => {
    onSelect(null, value);
  };

  const onAdd = () => {
    onSelect(null, inputValue);
    setInputValue('');
  };

  const addingIsDisabled =
    !inputValue || values.some((val) => val.toLowerCase() === inputValue.toLowerCase());

  return (
    <Stack hasGutter>
      <LabelGroup isClosable numLabels={999} onClick={onClear}>
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
            aria-label={t('Enter value')}
            onChange={(_event, value) => setInputValue(value)}
            placeholder={t('Enter value')}
            type="text"
            value={inputValue}
          />
        </InputGroupItem>
        <InputGroupItem>
          <Button isDisabled={addingIsDisabled} onClick={onAdd} variant="control">
            Add
          </Button>
        </InputGroupItem>
      </InputGroup>
    </Stack>
  );
};
