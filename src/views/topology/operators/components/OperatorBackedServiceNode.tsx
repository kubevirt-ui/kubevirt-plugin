import React from 'react';
import { useTranslation } from 'react-i18next';

import { Tooltip } from '@patternfly/react-core';
import {
  Node,
  observer,
  WithContextMenuProps,
  WithDndDropProps,
  WithDragNodeProps,
  WithSelectionProps,
} from '@patternfly/react-topology';

import { GroupNode } from '../../components/graph-view';

type OperatorBackedServiceNodeProps = {
  element: Node;
  badge?: string;
  badgeColor?: string;
  badgeClassName?: string;
  droppable?: boolean;
  canDrop?: boolean;
  dropTarget?: boolean;
  editAccess: boolean;
} & WithSelectionProps &
  WithContextMenuProps &
  WithDragNodeProps &
  WithDndDropProps;

const OperatorBackedServiceNode: React.FC<OperatorBackedServiceNodeProps> = ({
  canDrop,
  dropTarget,
  ...rest
}) => {
  const { t } = useTranslation();
  return (
    <Tooltip
      content={t('kubevirt-plugin~Create Service Binding')}
      trigger="manual"
      isVisible={dropTarget && canDrop}
      animationDuration={0}
      position="top"
    >
      <GroupNode bgClassName="odc-operator-backed-service__bg" {...rest} />
    </Tooltip>
  );
};

export default observer(OperatorBackedServiceNode);
