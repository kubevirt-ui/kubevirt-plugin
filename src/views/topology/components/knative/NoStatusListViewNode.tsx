import React, { FC } from 'react';

import { OdcBaseNode } from '../../elements';
import { getResourceKind } from '../../utils';
import { NodeType } from '../../utils/types/topology-types';
import { TopologyListViewNode, TypedResourceBadgeCell } from '../list-view';

import EventSourceIcon from './icons/EventSourceIcon';
import { eventIconStyle } from './icons/icon-utils';

interface NoStatusListViewNodeProps {
  item: OdcBaseNode;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
}

const NoStatusListViewNode: FC<NoStatusListViewNodeProps> = (props) => {
  const kind = getResourceKind(props.item);
  const badgeCell = (
    <TypedResourceBadgeCell
      key="type-icon"
      kind={kind}
      typeIcon={<EventSourceIcon style={eventIconStyle} />}
    />
  );
  return (
    <TopologyListViewNode
      noPods
      {...props}
      badgeCell={props.item.getType() === NodeType.EventSource ? badgeCell : null}
    />
  );
};
export { NoStatusListViewNode };
