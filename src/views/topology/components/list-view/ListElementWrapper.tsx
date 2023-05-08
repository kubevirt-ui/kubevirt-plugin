import React from 'react';
import { observer } from 'mobx-react';

import { labelForNodeKind } from '@console/shared';
import { isNode, Node } from '@patternfly/react-topology';

import { getResourceKind } from '../../utils/topology-utils';

import { listViewNodeComponentFactory } from './listViewComponentFactory';

interface ListElementWrapperProps {
  item: Node;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
}

// in a separate component so that changes to behaviors do not re-render children
const ListElementComponent: React.FC<ListElementWrapperProps> = observer(
  function ListElementComponent({ item, selectedIds, onSelect, children }) {
    const type = item.getType();

    const Component = React.useMemo(() => listViewNodeComponentFactory(type), [type]);
    return (
      <Component key={item.getId()} item={item} selectedIds={selectedIds} onSelect={onSelect}>
        {children}
      </Component>
    );
  },
);

const ListElementChildren: React.FC<ListElementWrapperProps> = observer(
  function ListElementChildren({ item, selectedIds, onSelect }) {
    return (
      <>
        {item
          .getChildren()
          .filter(isNode)
          .sort((a, b) =>
            labelForNodeKind(getResourceKind(a)).localeCompare(
              labelForNodeKind(getResourceKind(b)),
            ),
          )
          .map((e) => (
            <ListElementWrapper
              key={e.getId()}
              item={e as Node}
              onSelect={onSelect}
              selectedIds={selectedIds}
            />
          ))}
      </>
    );
  },
);

const ListElementWrapper: React.FC<ListElementWrapperProps> = observer(function ListElementWrapper({
  item,
  selectedIds,
  onSelect,
}) {
  if (!item.isVisible()) {
    return null;
  }

  return (
    <ListElementComponent item={item} onSelect={onSelect} selectedIds={selectedIds}>
      <ListElementChildren item={item} onSelect={onSelect} selectedIds={selectedIds} />
    </ListElementComponent>
  );
});

export default ListElementWrapper;
