import React from 'react';
import { useTranslation } from 'react-i18next';

import { useTelemetry } from '@console/shared/src/hooks/useTelemetry';
import { Select, SelectGroup, SelectOption, SelectVariant, Switch } from '@patternfly/react-core';

import {
  DisplayFilters,
  TopologyDisplayFilterType,
  TopologyViewType,
} from '../utils/types/topology-types';

import { EXPAND_GROUPS_FILTER_ID } from './const';

import './FilterDropdown.scss';

type FilterDropdownProps = {
  filters: DisplayFilters;
  viewType: TopologyViewType;
  supportedFilters: string[];
  onChange: (filter: DisplayFilters) => void;
  isDisabled?: boolean;
  opened?: boolean; // Use only for testing
};

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  filters,
  viewType,
  supportedFilters,
  onChange,
  isDisabled = false,
  opened = false,
}) => {
  const { t } = useTranslation();
  const fireTelemetryEvent = useTelemetry();
  const [isOpen, setIsOpen] = React.useState(opened);
  const groupsExpanded = filters?.find((f) => f.id === EXPAND_GROUPS_FILTER_ID)?.value ?? true;

  const onToggle = (open: boolean): void => setIsOpen(open);
  const onSelect = (e: React.MouseEvent, key: string) => {
    const index = filters.findIndex((f) => f.id === key);
    const filter = { ...filters[index], value: (e.target as HTMLInputElement).checked };
    onChange([...filters.slice(0, index), filter, ...filters.slice(index + 1)]);
    fireTelemetryEvent('Topology Display Option Changed', {
      property: key,
      value: (e.target as HTMLInputElement).checked,
    });
  };

  const onGroupsExpandedChange = (value: boolean) => {
    const index = filters?.findIndex((f) => f.id === EXPAND_GROUPS_FILTER_ID) ?? -1;
    if (index === -1) {
      return;
    }
    const filter = {
      ...filters[index],
      value,
    };
    onChange([...filters.slice(0, index), filter, ...filters.slice(index + 1)]);
    fireTelemetryEvent('Topology Display Option Changed', {
      property: EXPAND_GROUPS_FILTER_ID,
      value,
    });
  };

  const expandFilters = filters
    .filter(
      (f) =>
        f.type === TopologyDisplayFilterType.expand &&
        f.id !== EXPAND_GROUPS_FILTER_ID &&
        supportedFilters.includes(f.id),
    )
    .sort((a, b) => a.priority - b.priority);

  const showFilters = filters
    .filter((f) => f.type === TopologyDisplayFilterType.show && supportedFilters.includes(f.id))
    .sort((a, b) => a.priority - b.priority);

  const isSelectDisabled =
    isDisabled ||
    (viewType === TopologyViewType.graph
      ? !expandFilters.length && !showFilters.length
      : !expandFilters.length);

  const selectContent = (
    <div className="odc-topology-filter-dropdown">
      {expandFilters.length ? (
        <div className="odc-topology-filter-dropdown__group">
          <span className="odc-topology-filter-dropdown__expand-groups-switcher">
            <span className="pf-c-select__menu-group-title">{t('kubevirt-plugin~Expand')}</span>
            <Switch
              aria-label={t('kubevirt-plugin~Collapse groups')}
              isChecked={groupsExpanded}
              onChange={onGroupsExpandedChange}
            />
          </span>
          <SelectGroup className="odc-topology-filter-dropdown__expand-groups-label">
            {expandFilters.map((filter) => (
              <SelectOption
                key={filter.id}
                value={filter.id}
                isDisabled={!groupsExpanded}
                isChecked={filter.value}
              >
                {filter.labelKey ? t(filter.labelKey) : filter.label}
              </SelectOption>
            ))}
          </SelectGroup>
        </div>
      ) : null}
      {viewType === TopologyViewType.graph && showFilters.length ? (
        <div className="odc-topology-filter-dropdown__group">
          <SelectGroup label={t('kubevirt-plugin~Show')}>
            {showFilters.map((filter) => (
              <SelectOption key={filter.id} value={filter.id} isChecked={filter.value}>
                {filter.labelKey ? t(filter.labelKey) : filter.label}
              </SelectOption>
            ))}
          </SelectGroup>
        </div>
      ) : null}
    </div>
  );

  return (
    <Select
      className="odc-topology-filter-dropdown__select"
      variant={SelectVariant.checkbox}
      customContent={selectContent}
      isDisabled={isSelectDisabled}
      onToggle={onToggle}
      isOpen={isOpen}
      onSelect={onSelect}
      placeholderText={t('kubevirt-plugin~Display options')}
      isGrouped
      isCheckboxSelectionBadgeHidden
    />
  );
};

export default FilterDropdown;
