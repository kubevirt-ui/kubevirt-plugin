import React from 'react';
import classNames from 'classnames';

import { modelFor, referenceFor } from '@console/internal/module/k8s';
import { useAccessReviewAllowed } from '@openshift-console/dynamic-plugin-sdk';
import {
  DefaultEdge,
  Edge,
  EdgeTerminalType,
  NodeStatus,
  observer,
  useSelection,
  WithContextMenuProps,
  WithRemoveConnectorProps,
  WithSourceDragProps,
  WithTargetDragProps,
} from '@patternfly/react-topology';

import { getResource } from '../../../../utils';

import './BaseEdge.scss';

type BaseEdgeProps = {
  element: Edge;
  dragging?: boolean;
  className?: string;
  animationDuration?: number;
  startTerminalType?: EdgeTerminalType;
  startTerminalClass?: string;
  startTerminalStatus?: NodeStatus;
  endTerminalType?: EdgeTerminalType;
  endTerminalClass?: string;
  endTerminalStatus?: NodeStatus;
  tag?: string;
  tagClass?: string;
  tagStatus?: NodeStatus;
} & WithRemoveConnectorProps &
  Partial<WithSourceDragProps> &
  Partial<WithTargetDragProps> &
  Partial<WithContextMenuProps>;

const BaseEdge: React.FC<BaseEdgeProps> = ({
  className,
  element,
  endTerminalType = EdgeTerminalType.directional,
  onShowRemoveConnector,
  onHideRemoveConnector,
  targetDragRef,
  sourceDragRef,
  ...rest
}) => {
  const resourceObj = getResource(element.getSource());
  const resourceModel = resourceObj && modelFor(referenceFor(resourceObj));
  const [selected, onSelect] = useSelection({ controlled: true });

  const editAccess = useAccessReviewAllowed({
    group: resourceModel?.apiGroup,
    verb: 'patch',
    resource: resourceModel?.plural,
    name: resourceObj?.metadata.name,
    namespace: resourceObj?.metadata.namespace,
  });

  return (
    <DefaultEdge
      className={classNames('odc-base-edge', className)}
      element={element}
      onShowRemoveConnector={editAccess ? onShowRemoveConnector : undefined}
      onHideRemoveConnector={editAccess ? onHideRemoveConnector : undefined}
      targetDragRef={editAccess ? targetDragRef : undefined}
      sourceDragRef={editAccess ? sourceDragRef : undefined}
      endTerminalType={endTerminalType}
      selected={selected}
      onSelect={onSelect}
      {...rest}
    />
  );
};

export default observer(BaseEdge);
