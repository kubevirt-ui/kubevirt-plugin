import React, { type FC, useMemo } from 'react';

import { type ExtendedRowFilterItem } from '@kubevirt-utils/components/ListPageFilter/types';
import { type UniversalFilter } from '@kubevirt-utils/hooks/useUniversalFilter/useUniversalFilter';
import { type RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { Checkbox, Stack, StackItem } from '@patternfly/react-core';
import { TEMPLATE_TYPE_ID } from '@templates/list/filters/constants';
import { TemplateFilterType } from '@templates/list/filters/types';

import { type TemplateTypeSelectionState } from '../utils';

type TemplatesTypeFilterProps = {
  rowFilter: RowFilter;
  typeSelection: TemplateTypeSelectionState;
  universalFilter: UniversalFilter;
};

const TemplatesTypeFilter: FC<TemplatesTypeFilterProps> = ({
  rowFilter,
  typeSelection,
  universalFilter: { isSelected, setValue },
}) => {
  const typeIds = useMemo(() => rowFilter.items.map((item) => item.id), [rowFilter.items]);
  const { isOpenShiftTypeSelected, isVirtualMachineTypeSelected, noTypeSelected } = typeSelection;

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
        typeIds.filter((selectedTypeId) => selectedTypeId !== typeId),
      );
      return;
    }

    const selectedIds = typeIds.filter((selectedTypeId) =>
      isSelected(TemplateFilterType.Type, selectedTypeId),
    );
    const nextSelectedIds = selectedIds.includes(typeId)
      ? selectedIds.filter((selectedTypeId) => selectedTypeId !== typeId)
      : [...selectedIds, typeId];

    // Nothing or both selected → clear query (treat as all types).
    if (nextSelectedIds.length === 0 || nextSelectedIds.length === typeIds.length) {
      setValue(TemplateFilterType.Type);
      return;
    }

    setValue(TemplateFilterType.Type, nextSelectedIds);
  };

  return (
    <Stack data-test={`filter-category-${rowFilter.filterGroupName}`} hasGutter>
      <h5 className="pf-v6-u-text-color-subtle">{rowFilter.filterGroupName}</h5>
      {rowFilter.items.map((item: ExtendedRowFilterItem) => (
        <StackItem data-test={`${rowFilter.type}-${item.id}`} key={item.id}>
          <Checkbox
            id={`filter-${rowFilter.type}-${item.id}`}
            isChecked={isTypeChecked(item.id)}
            label={item.content ?? item.title}
            onChange={() => onTypeChange(item.id)}
          />
        </StackItem>
      ))}
    </Stack>
  );
};

export default TemplatesTypeFilter;
