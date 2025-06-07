import { ComponentType } from 'react';

import {
  contextMenuActions,
  createConnectorCallback,
  withContextMenu,
  withCreateConnector,
  withEditReviewAccess,
} from '@openshift-console/dynamic-plugin-sdk-internal';
import {
  GraphElement,
  NodeComponentProps,
  nodeDragSourceSpec,
  nodeDropTargetSpec,
  withDndDrop,
  withDragNode,
  withSelection,
} from '@patternfly/react-topology';

import CreateConnector from '../components/CreateConnector';
import VMNode from '../components/nodes/VMNode/VMNode';

import { VIRTUAL_MACHINE_TYPE } from './constants';

export const getKubevirtComponentFactory = (
  _kind,
  type,
): ComponentType<{ element: GraphElement }> | undefined =>
  type === VIRTUAL_MACHINE_TYPE
    ? withCreateConnector(
        createConnectorCallback(),
        CreateConnector,
      )(
        withDndDrop<
          any,
          any,
          { canDrop?: boolean; droppable?: boolean; hover?: boolean },
          NodeComponentProps
        >(nodeDropTargetSpec())(
          withEditReviewAccess('patch')(
            withDragNode(nodeDragSourceSpec(type))(
              withSelection({ controlled: true })(withContextMenu(contextMenuActions)(VMNode)),
            ),
          ),
        ),
      )
    : undefined;
