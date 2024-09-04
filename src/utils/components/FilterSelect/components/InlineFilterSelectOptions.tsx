import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { SelectGroup, SelectOption } from '@patternfly/react-core';

import { NO_RESULTS } from '../utils/constants';
import { EnhancedSelectOptionProps } from '../utils/types';

import InlineFilterSelectOption from './InlineFilterSelectOption';

type InlineFilterSelectOptionsProps = {
  filterOptions: EnhancedSelectOptionProps[];
  filterValue: string;
  focusedItemIndex: number;
  groupedOptions: Record<string, EnhancedSelectOptionProps[]>;
};
const InlineFilterSelectOptions: FC<InlineFilterSelectOptionsProps> = ({
  filterOptions,
  filterValue,
  focusedItemIndex,
  groupedOptions,
}) => {
  const { t } = useKubevirtTranslation();
  if (isEmpty(filterOptions)) {
    return (
      <SelectOption isDisabled value={NO_RESULTS}>
        {t('No results found for "{{value}}"', { value: filterValue })}
      </SelectOption>
    );
  }

  if (groupedOptions) {
    return (
      <>
        {Object.entries(groupedOptions).map(([group, opts]) => (
          <SelectGroup key={group} label={group}>
            {opts.map((option, index) => (
              <InlineFilterSelectOption
                isFocused={focusedItemIndex === index}
                key={option.value}
                option={option}
              />
            ))}
          </SelectGroup>
        ))}
      </>
    );
  }

  return (
    <>
      {filterOptions.map((option, index) => (
        <InlineFilterSelectOption
          isFocused={focusedItemIndex === index}
          key={option.value}
          option={option}
        />
      ))}
    </>
  );
};

export default InlineFilterSelectOptions;
