import React from 'react';

import { DataListCell } from '@patternfly/react-core';
import { observer } from '@patternfly/react-topology';

import { OdcBaseNode } from '../../elements';
import { TopologyListViewNode, TypedResourceBadgeCell } from '../list-view';

interface SinkUriListViewNodeProps {
  item: OdcBaseNode;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
}

const ObservedSinkURIListViewNode: React.FC<SinkUriListViewNodeProps> = ({ item, ...rest }) => {
  const sinkUri = item.getResource()?.spec?.sinkUri;

  const labelCell = (
    <DataListCell className="odc-topology-list-view__label-cell" key="label" id={sinkUri}>
      <TypedResourceBadgeCell key="type-icon" kind={item.getResourceKind()} />
      {sinkUri}
    </DataListCell>
  );

  return <TopologyListViewNode item={item} labelCell={labelCell} noPods {...rest} />;
};

const SinkURIListViewNode = observer(ObservedSinkURIListViewNode);
export default SinkURIListViewNode;
