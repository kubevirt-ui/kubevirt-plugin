import classNames from 'classnames';
import React, { Dispatch, FC, SetStateAction, useMemo, useState } from 'react';

import { FilterableObject } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { Label, SelectList } from '@patternfly/react-core';

import { MAX_SUGGESTIONS, suggestionBoxKeyHandler } from '../constants';
import { useDocumentListener } from '../hooks/useDocumentListener';
import { fuzzyCaseInsensitive, labelParser } from '../utils';

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

  const onSelect = (value: string) => {
    onSuggestionSelect(value);
    setVisible(false);
  };

  const handleInput = (input: string) => {
    setTextValue(input);
    setVisible(true);
    // User input without whitespace
    const processedText = input.trim().replace(/\s*=\s*/, '=');
    const filtered = processedData
      .filter((item) => fuzzyCaseInsensitive(processedText, item))
      .slice(0, MAX_SUGGESTIONS);
    setSuggestions(filtered);
  };

  return (
    <div className="co-suggestion-box" ref={ref}>
      <SearchFilter
        onChange={(_, input: string) => handleInput(input)}
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
