import React, { FC } from 'react';

import { SelectOption } from '@patternfly/react-core';

type FilterSelectOptionProps = {
  optionLabel: string;
  optionName: string;
};

const FilterSelectOption: FC<FilterSelectOptionProps> = ({ optionLabel, optionName }) => (
  <SelectOption
    key={optionName}
    value={optionName}
    data-test-id={`${optionLabel}-select-option-${optionName}`}
  />
);

export default FilterSelectOption;
