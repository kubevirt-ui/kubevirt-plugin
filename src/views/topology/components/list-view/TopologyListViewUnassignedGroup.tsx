import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
} from '@patternfly/react-core';
import { Node, observer } from '@patternfly/react-topology';

import { getChildKinds } from './list-view-utils';
import TopologyListViewKindGroup from './TopologyListViewKindGroup';

interface TopologyListViewUnassignedGroupProps {
  items: Node[];
  showCategory: boolean;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
}

const TopologyListViewUnassignedGroup: React.FC<TopologyListViewUnassignedGroupProps> = ({
  items,
  showCategory,
  selectedIds,
  onSelect,
}) => {
  const { t } = useTranslation();
  if (!items?.length) {
    return null;
  }

  const { kindsMap, kindKeys } = getChildKinds(items);

  const unassignedContent = (
    <DataList aria-label="unassigned items" id="unassigned-items">
      {kindKeys.map((key) => (
        <TopologyListViewKindGroup
          groupLabel={t('kubevirt-plugin~unassigned')}
          key={key}
          kind={key}
          childElements={kindsMap[key]}
          selectedIds={selectedIds}
          onSelect={onSelect}
        />
      ))}
    </DataList>
  );

  if (!showCategory) {
    return unassignedContent;
  }

  const cells = [];
  cells.push(
    <DataListCell
      key="label"
      className="odc-topology-list-view__unassigned-label"
      id="unassigned_label"
    >
      {t('kubevirt-plugin~No application group')}
    </DataListCell>,
  );

  return (
    <DataListItem
      className="odc-topology-list-view__application"
      key="unassigned"
      aria-labelledby="unassigned_label"
      isExpanded
    >
      <DataListItemRow className="odc-topology-list-view__application-row odc-topology-list-view__unassigned-group">
        <DataListItemCells dataListCells={cells} />
      </DataListItemRow>
      {unassignedContent}
    </DataListItem>
  );
};

export default observer(TopologyListViewUnassignedGroup);
