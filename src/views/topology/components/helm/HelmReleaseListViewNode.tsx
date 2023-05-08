import React, { FC } from 'react';

import { Node, observer } from '@patternfly/react-topology';

import { getResourceKind } from '../../utils';
import { TopologyListViewNode, TypedResourceBadgeCell } from '../list-view';

interface HelmReleaseListViewNodeProps {
  item: Node;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
}

const HelmReleaseListViewNode: FC<HelmReleaseListViewNodeProps> = ({
  item,
  selectedIds,
  onSelect,
  children,
}) => {
  const { data } = item.getData();
  const kind = getResourceKind(item);
  const typeIconClass = data.chartIcon || 'icon-helm';

  const badgeCell = (
    <TypedResourceBadgeCell key="type-icon" kind={kind} typeIconClass={typeIconClass} />
  );

  return (
    <TopologyListViewNode
      item={item}
      selectedIds={selectedIds}
      onSelect={onSelect}
      badgeCell={badgeCell}
    >
      {children}
    </TopologyListViewNode>
  );
};

export default observer(HelmReleaseListViewNode);
