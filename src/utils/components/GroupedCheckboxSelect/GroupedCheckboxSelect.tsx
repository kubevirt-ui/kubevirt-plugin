import React, { type FC, Fragment, type ReactNode, useMemo, useState } from 'react';

import ToolbarFilterMultiChip from '@kubevirt-utils/components/KubevirtFilterToolbar/components/ToolbarFilter/ToolbarFilterMultiChip';
import useItemCounts from '@kubevirt-utils/components/KubevirtFilterToolbar/hooks/useItemCounts';
import { getOnSelect } from '@kubevirt-utils/components/KubevirtFilterToolbar/utils';
import ToolbarFilterToggle from '@kubevirt-utils/components/toggles/ToolbarFilterToggle';
import {
  type KubevirtFilter,
  type KubevirtFilterOptionGroup,
  type KubevirtFilterState,
  type OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import {
  Badge,
  Divider,
  type MenuToggleProps,
  Select,
  SelectGroup,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { type DataViewFilterOption } from '@patternfly/react-data-view';

type GroupedCheckboxSelectProps = {
  data: K8sResourceCommon[];
  dataTestId?: string;
  filterDef: KubevirtFilter;
  filters: KubevirtFilterState;
  isToggleVisible?: boolean;
  onSetFilters: OnSetFilters;
  toggleSize?: MenuToggleProps['size'];
};

const GroupedCheckboxSelect: FC<GroupedCheckboxSelectProps> = ({
  data,
  dataTestId,
  filterDef,
  filters,
  isToggleVisible = true,
  onSetFilters,
  toggleSize,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedValues = filters[filterDef.id] ?? [];
  const onSelect = getOnSelect(filters, onSetFilters);

  const allCounts = useItemCounts([filterDef], isToggleVisible ? data : undefined);
  const itemCounts = allCounts[filterDef.id] ?? {};

  const optionsMap = useMemo(
    () => new Map(filterDef.options?.map((opt) => [opt.value, opt])),
    [filterDef.options],
  );

  const toggle = ToolbarFilterToggle({
    'data-test': dataTestId,
    isExpanded: isOpen,
    onClick: () => setIsOpen((prev) => !prev),
    selectedValues,
    showAllBadge: filterDef.showAllBadge,
    size: toggleSize,
    title: filterDef.categoryLabel,
  });

  const renderGroup = (group: KubevirtFilterOptionGroup, groupIdx: number): ReactNode => {
    const groupOptions = group.values
      .map((value) => optionsMap.get(value))
      .filter((opt): opt is DataViewFilterOption => !!opt);

    if (isEmpty(groupOptions)) return null;

    return (
      <Fragment key={groupIdx}>
        {groupIdx > 0 && <Divider />}
        <SelectGroup label={group.label}>
          <SelectList>
            {groupOptions.map(({ label, value }) => {
              const count = itemCounts[value];
              const isDisabled = !count;

              return (
                <SelectOption
                  data-test-row-filter={value}
                  hasCheckbox
                  isDisabled={isDisabled}
                  isSelected={selectedValues.includes(value)}
                  key={value}
                  value={value}
                >
                  <span className="co-filter-dropdown-item__name">{label}</span>
                  <Badge isRead>{isDisabled ? NO_DATA_DASH : count}</Badge>
                </SelectOption>
              );
            })}
          </SelectList>
        </SelectGroup>
      </Fragment>
    );
  };

  return (
    <ToolbarFilterMultiChip filterDef={filterDef} filters={filters} onSetFilters={onSetFilters}>
      {isToggleVisible && (
        <Select
          isOpen={isOpen}
          isScrollable
          onOpenChange={setIsOpen}
          onSelect={(_event, value: string) => {
            onSelect(filterDef.id, value);
          }}
          role="menu"
          selected={selectedValues}
          toggle={toggle}
        >
          {filterDef.optionGroups?.map(renderGroup)}
        </Select>
      )}
    </ToolbarFilterMultiChip>
  );
};

export default GroupedCheckboxSelect;
