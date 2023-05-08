import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { modelFor, referenceFor } from '@console/internal/module/k8s';
import { RootState } from '@console/internal/redux';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import {
  CREATE_CONNECTOR_DROP_TYPE,
  DropTargetSpec,
  GraphElement,
  isEdge,
  Node,
  observer,
  useDndDrop,
  WithContextMenuProps,
  WithDndDropProps,
  WithDragNodeProps,
  WithSelectionProps,
} from '@patternfly/react-topology';

import {
  canDropEdgeOnNode,
  highlightNode,
  NodeComponentProps,
  nodesEdgeIsDragging,
} from '../../components/graph-view/components';
import { getKindStringAndAbbreviation } from '../../components/graph-view/components/nodes/nodeUtils';
import { getResource, getServiceBindingStatus } from '../../utils/topology-utils';

import OperatorBackedServiceGroup from './OperatorBackedServiceGroup';
import OperatorBackedServiceNode from './OperatorBackedServiceNode';

import './OperatorBackedService.scss';

export const obsDropTargetSpec = (
  serviceBinding: boolean,
): DropTargetSpec<
  GraphElement,
  any,
  { canDrop: boolean; dropTarget: boolean; edgeDragging: boolean },
  NodeComponentProps
> => ({
  accept: [CREATE_CONNECTOR_DROP_TYPE],
  canDrop: (item, monitor, props) => {
    if (!serviceBinding) {
      return false;
    }

    if (isEdge(item)) {
      return canDropEdgeOnNode(monitor.getOperation()?.type, item, props.element);
    }
    if (!props.element || item === props.element) {
      return false;
    }
    return !props.element.getTargetEdges().find((e) => e.getSource() === item);
  },
  collect: (monitor, props) => {
    return {
      canDrop: serviceBinding && highlightNode(monitor, props.element),
      dropTarget: monitor.isOver({ shallow: true }),
      edgeDragging: nodesEdgeIsDragging(monitor, props),
    };
  },
  dropHint: 'createServiceBinding',
});

interface StateProps {
  serviceBinding: boolean;
}

type OperatorBackedServiceProps = {
  element: Node;
} & WithSelectionProps &
  WithDndDropProps &
  WithDragNodeProps &
  WithContextMenuProps &
  StateProps;

const OperatorBackedService: React.FC<OperatorBackedServiceProps> = ({
  serviceBinding,
  element,
  ...rest
}) => {
  const spec = React.useMemo(() => obsDropTargetSpec(serviceBinding), [serviceBinding]);
  const [dndDropProps, dndDropRef] = useDndDrop(spec, { element, ...rest });
  const resourceObj = getResource(element);
  const resourceModel = resourceObj ? modelFor(referenceFor(resourceObj)) : null;
  const [canEdit] = useAccessReview({
    group: resourceModel?.apiGroup,
    verb: 'patch',
    resource: resourceModel?.plural,
    name: resourceObj?.metadata.name,
    namespace: resourceObj?.metadata.namespace,
  });
  const { data } = element.getData();
  const ownerReferenceKind = referenceFor({ kind: data.operatorKind, apiVersion: data.apiVersion });
  const { kindAbbr, kindStr, kindColor } = getKindStringAndAbbreviation(ownerReferenceKind);
  const badgeClassName = classNames('odc-resource-icon', {
    [`odc-resource-icon-${kindStr.toLowerCase()}`]: !kindColor,
  });

  if (element.isCollapsed()) {
    return (
      <OperatorBackedServiceNode
        {...rest}
        element={element}
        dndDropRef={dndDropRef}
        editAccess={canEdit}
        badge={kindAbbr}
        badgeColor={kindColor}
        badgeClassName={badgeClassName}
        {...dndDropProps}
      />
    );
  }

  return (
    <OperatorBackedServiceGroup
      {...rest}
      element={element}
      dndDropRef={dndDropRef}
      editAccess={canEdit}
      badge={kindAbbr}
      badgeColor={kindColor}
      badgeClassName={badgeClassName}
      {...dndDropProps}
    />
  );
};

const mapStateToProps = (state: RootState): StateProps => {
  return {
    serviceBinding: getServiceBindingStatus(state),
  };
};

export default connect(mapStateToProps)(observer(OperatorBackedService));
