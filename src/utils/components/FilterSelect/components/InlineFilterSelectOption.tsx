import React, { type FC } from 'react';

import { SelectOption } from '@patternfly/react-core';

import { type EnhancedSelectOptionProps } from '../utils/types';
import InlineFilterSelectOptionContent from './InlineFilterSelectOptionContent';

type InlineFilterSelectOptionProps = {
  isFocused: boolean;
  option: EnhancedSelectOptionProps;
};
const InlineFilterSelectOption: FC<InlineFilterSelectOptionProps> = ({ isFocused, option }) => {
  const optionValue = String(option.value);
  const { key: _key, ...optionWithoutKey } = option;
  return (
    <SelectOption
      data-test={`select-option-${optionValue}`}
      id={`select-inline-filter-${optionValue.replace(' ', '-')}`}
      isFocused={isFocused}
      value={optionValue}
      {...optionWithoutKey}
    >
      <InlineFilterSelectOptionContent option={option} />
    </SelectOption>
  );
};

export default InlineFilterSelectOption;
