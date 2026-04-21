import React, { FC } from 'react';

import { SelectOption } from '@patternfly/react-core';

import { EnhancedSelectOptionProps } from '../utils/types';

import InlineFilterSelectOptionContent from './InlineFilterSelectOptionContent';

type InlineFilterSelectOptionProps = {
  isFocused: boolean;
  option: EnhancedSelectOptionProps;
};
const InlineFilterSelectOption: FC<InlineFilterSelectOptionProps> = ({ isFocused, option }) => {
  return (
    <SelectOption
      data-test-id={`select-option-${option.value}`}
      id={`select-inline-filter-${option.value?.replace(' ', '-')}`}
      isFocused={isFocused}
      value={option.value}
      {...option}
    >
      <InlineFilterSelectOptionContent option={option} />
    </SelectOption>
  );
};

export default InlineFilterSelectOption;
