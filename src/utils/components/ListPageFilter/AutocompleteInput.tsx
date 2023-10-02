import React, { Dispatch, FC, SetStateAction, useMemo, useState } from 'react';
import classNames from 'classnames';

import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { MAX_SUGGESTIONS } from './constants';
import SearchFilter from './SearchFilter';
import SuggestionLine from './SuggestionLine';
import { fuzzyCaseInsensitive, labelParser } from './utils';

type AutocompleteInputProps = {
  className?: string;
  data?: K8sResourceCommon[];
  onSuggestionSelect: (selected: string) => void;
  placeholder?: string;
  setTextValue: Dispatch<SetStateAction<string>>;
  suggestionCount?: number;
  textValue: string;
};

const AutocompleteInput: FC<AutocompleteInputProps> = ({
  className,
  data,
  onSuggestionSelect,
  placeholder,
  setTextValue,
  textValue,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>();
  const [visible, setVisible] = useState<boolean>(true);

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
    <div className="co-suggestion-box">
      <SearchFilter onChange={handleInput} placeholder={placeholder} value={textValue} />
      {visible && (
        <div
          className={classNames('co-suggestion-box__suggestions', {
            'co-suggestion-box__suggestions--shadowed': suggestions?.length > 0,
          })}
        >
          {suggestions?.map((elem) => (
            <SuggestionLine className={className} key={elem} onClick={onSelect} suggestion={elem} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
