import React, { ReactNode } from 'react';

import FilterSelectOption from '../FilterSelectOption/FilterSelectOption';

type FilterSelectOptionsProps = {
  options: string[];
  optionLabel: string;
};

const FilterSelectOptions = ({ options, optionLabel }: FilterSelectOptionsProps): ReactNode[] =>
  options.map((option) => (
    <FilterSelectOption key={option} optionLabel={optionLabel} optionName={option} />
  ));

export default FilterSelectOptions;
