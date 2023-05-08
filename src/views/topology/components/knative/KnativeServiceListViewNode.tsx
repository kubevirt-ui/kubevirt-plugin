import React, { FC } from 'react';

import { Node, observer } from '@patternfly/react-topology';

import { getResource, getResourceKind } from '../../utils';
import { isServerlessFunction } from '../../utils/knative-topology-utils';
import { TopologyListViewNode, TypedResourceBadgeCell } from '../list-view';

interface KnativeServiceListViewNodeProps {
  item: Node;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
}

const ObservedKnativeServiceListViewNode: FC<KnativeServiceListViewNodeProps> = ({
  item,
  selectedIds,
  onSelect,
  children,
}) => {
  const kind = getResourceKind(item);

  const typeIconClass: string = isServerlessFunction(getResource(item))
    ? 'icon-serverless-function'
    : 'icon-knative';

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

const KnativeServiceListViewNode = observer(ObservedKnativeServiceListViewNode);
export default KnativeServiceListViewNode;
