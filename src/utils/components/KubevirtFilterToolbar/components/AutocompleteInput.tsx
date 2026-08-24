import React, { type Dispatch, type FC, type SetStateAction, useMemo, useState } from 'react';
import classNames from 'classnames';

import { type FilterableObject } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { labelParser } from '@kubevirt-utils/utils/labelUtils';
import { fuzzyCaseInsensitive } from '@kubevirt-utils/utils/utils';
import { Label, SelectList } from '@patternfly/react-core';

import { MAX_SUGGESTIONS, suggestionBoxKeyHandler } from '../constants';

import { useDocumentListener } from '../hooks/useDocumentListener';
import SearchFilter from './SearchFilter';

type AutocompleteInputProps = {
  data?: FilterableObject[];
  onSuggestionSelect: (selected: string) => void;
  placeholder: string;
  setTextValue: Dispatch<SetStateAction<string>>;
  suggestionCount?: number;
  textValue: string;
};

const AutocompleteInput: FC<AutocompleteInputProps> = ({
  data,
  onSuggestionSelect,
  placeholder,
  setTextValue,
  textValue,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>();
  const { ref, setVisible, visible } = useDocumentListener<HTMLDivElement>(suggestionBoxKeyHandler);

  const processedData = useMemo(() => Array.from(labelParser(data)), [data]);

  const onSelect = (value: string): void => {
    onSuggestionSelect(value);
    setVisible(false);
  };

  const handleInput = (input: string): void => {
    setTextValue(input);
    setVisible(true);
    const trimmed = input.trim();
    const eqIdx = trimmed.indexOf('=');
    const processedText =
      eqIdx >= 0
        ? trimmed.substring(0, eqIdx).trimEnd() + '=' + trimmed.substring(eqIdx + 1).trimStart()
        : trimmed;
    const filtered = processedData
      .filter((item) => fuzzyCaseInsensitive(processedText, item))
      .slice(0, MAX_SUGGESTIONS);
    setSuggestions(filtered);
  };

  return (
    <div className="co-suggestion-box" ref={ref}>
      <SearchFilter
        onChange={(_event, input: string) => handleInput(input)}
        placeholder={placeholder}
        value={textValue}
      />
      {visible && (
        <SelectList
          className={classNames('co-suggestion-box__suggestions', {
            'co-suggestion-box__suggestions--shadowed': suggestions && suggestions?.length > 0,
          })}
        >
          {suggestions?.map((elem) => (
            <div key={elem}>
              <Label color="purple" onClick={() => onSelect(elem)} variant="outline">
                {elem}
              </Label>
            </div>
          ))}
        </SelectList>
      )}
    </div>
  );
};

export default AutocompleteInput;
