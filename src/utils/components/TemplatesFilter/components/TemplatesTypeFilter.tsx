import React, { type FC, useMemo } from 'react';

import { type KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { type TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { Checkbox, Stack, StackItem } from '@patternfly/react-core';
import { TEMPLATE_TYPE_ID } from '@templates/list/filters/constants';
import { TemplateFilterType } from '@templates/list/filters/types';

import { type TemplateTypeSelectionState } from '../utils';

import { type UniversalFilter } from '../../../hooks/useUniversalFilter/useUniversalFilter';

type TemplatesTypeFilterProps = {
  filterDefinition: KubevirtFilter<TemplateOrRequest>;
  typeSelection: TemplateTypeSelectionState;
  universalFilter: UniversalFilter;
};

const TemplatesTypeFilter: FC<TemplatesTypeFilterProps> = ({
  filterDefinition,
  typeSelection,
  universalFilter: { isSelected, setValue },
}) => {
  const { categoryLabel, id, options } = filterDefinition;
  const { isOpenShiftTypeSelected, isVirtualMachineTypeSelected, noTypeSelected } = typeSelection;

  const optionValues = useMemo(() => options?.map(({ value }) => value) ?? [], [options]);

  const isTypeChecked = (typeId: string): boolean => {
    if (typeId === TEMPLATE_TYPE_ID.OPENSHIFT) {
      return isOpenShiftTypeSelected;
    }

    if (typeId === TEMPLATE_TYPE_ID.VM) {
      return isVirtualMachineTypeSelected;
    }

    return noTypeSelected;
  };

  const onTypeChange = (typeId: string): void => {
    if (noTypeSelected) {
      // Both appear selected; unchecking one leaves only the other.
      setValue(
        TemplateFilterType.Type,
        optionValues.filter((value) => value !== typeId),
      );
      return;
    }

    const selectedValues = optionValues.filter((value) =>
      isSelected(TemplateFilterType.Type, value),
    );
    const nextSelectedValues = selectedValues.includes(typeId)
      ? selectedValues.filter((value) => value !== typeId)
      : [...selectedValues, typeId];

    // Nothing or both selected → clear query (treat as all types).
    if (nextSelectedValues.length === 0 || nextSelectedValues.length === optionValues.length) {
      setValue(TemplateFilterType.Type);
      return;
    }

    setValue(TemplateFilterType.Type, nextSelectedValues);
  };

  return (
    <Stack data-test={`filter-category-${categoryLabel}`} hasGutter>
      <h5 className="pf-v6-u-text-color-subtle">{categoryLabel}</h5>
      {options?.map(({ label, value }) => (
        <StackItem data-test={`${id}-${value}`} key={value}>
          <Checkbox
            id={`filter-${id}-${value}`}
            isChecked={isTypeChecked(value)}
            label={label}
            onChange={() => onTypeChange(value)}
          />
        </StackItem>
      ))}
    </Stack>
  );
};

export default TemplatesTypeFilter;
