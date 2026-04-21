import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  InputGroup,
  InputGroupItem,
  KeyTypes,
  Label,
  LabelGroup,
  Stack,
  TextInput,
} from '@patternfly/react-core';

export type LabelsEditorProps = {
  addButtonText?: string;
  isHidden?: boolean;
  numLabelsToShow?: number;
  onClear?: () => void;
  onSelect?: (event, selection: string) => void;
  textInputPlaceholder?: string;
  values: string[];
};

export const LabelsEditor: FC<LabelsEditorProps> = ({
  addButtonText,
  isHidden,
  numLabelsToShow,
  onClear,
  onSelect,
  textInputPlaceholder: textInputPlaceholderProp,
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

  const textInputPlaceholder = textInputPlaceholderProp ?? t('Enter value');

  if (isHidden) return null;

  return (
    <Stack hasGutter>
      <LabelGroup isClosable numLabels={numLabelsToShow} onClick={onClear}>
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
              if (event.key === KeyTypes.Enter && !addingIsDisabled) {
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
          <Button isDisabled={addingIsDisabled} onClick={onAdd} variant={ButtonVariant.control}>
            {addButtonText ?? t('Add')}
          </Button>
        </InputGroupItem>
      </InputGroup>
    </Stack>
  );
};
