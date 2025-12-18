import React, { FC, Ref, useRef } from 'react';
import classNames from 'classnames';

import { TopologyDataObject } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/topology-types';
import { BaseNode } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Tooltip } from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';
import {
  Node,
  NodeModel,
  observer,
  RectAnchor,
  useAnchor,
  WithContextMenuProps,
  WithCreateConnectorProps,
  WithDndDropProps,
  WithDragNodeProps,
  WithSelectionProps,
} from '@patternfly/react-topology';

import { VMNodeData } from '../../../utils/types/types';

import { getImageProps, getStatusClass } from './utils/utils';

import './VMNode.scss';

export type VMNodeProps = {
  canDrop?: boolean;
  dragging?: boolean;
  dropTarget?: boolean;
  edgeDragging?: boolean;
  element: Node<NodeModel, TopologyDataObject<VMNodeData>>;
  highlight?: boolean;
  hover?: boolean;
  urlAnchorRef?: Ref<SVGCircleElement>;
} & WithSelectionProps &
  WithContextMenuProps &
  WithDragNodeProps &
  WithDndDropProps &
  WithCreateConnectorProps;

const VM_STATUS_GAP = 7;
const VM_STATUS_WIDTH = 7;
const VM_STATUS_RADIUS = 7;

const ObservedVMNode: FC<VMNodeProps> = ({ canDrop, children, dropTarget, element, ...rest }) => {
  const ref = useRef();
  useAnchor(RectAnchor);
  const { height, width } = element.getBounds();
  const vmData = element.getData().data;
  const { kind, osImage, vmStatus } = vmData;
  const iconRadius = Math.min(width, height) * 0.25;
  const tipContent = `Create a visual connector`;

  const statusClass = getStatusClass(vmStatus);
  const imageProps = getImageProps(height, width, iconRadius);

  const statusRect = (
    <rect
      className="kubevirt-vm-node__status"
      height={height - VM_STATUS_GAP * 2}
      rx={VM_STATUS_RADIUS}
      ry={VM_STATUS_RADIUS}
      width={width - VM_STATUS_GAP * 2}
      x={VM_STATUS_GAP}
      y={VM_STATUS_GAP}
    />
  );

  const imageComponent = osImage ? (
    <image {...imageProps} xlinkHref={osImage} />
  ) : (
    <VirtualMachineIcon {...imageProps} />
  );

  return (
    <g>
      <Tooltip
        animationDuration={0}
        content={tipContent}
        isVisible={dropTarget && canDrop}
        trigger="manual"
        triggerRef={ref}
      >
        <g ref={ref}>
          <BaseNode
            canDrop={canDrop}
            className={classNames('kubevirt-vm-node', statusClass)}
            dropTarget={dropTarget}
            element={element}
            kind={kind}
            {...rest}
          >
            {vmStatus ? <Tooltip content={vmStatus}>{statusRect}</Tooltip> : statusRect}
            <rect
              className="kubevirt-vm-node__bg"
              height={height - (VM_STATUS_GAP + VM_STATUS_WIDTH) * 2}
              width={width - (VM_STATUS_GAP + VM_STATUS_WIDTH) * 2}
              x={VM_STATUS_GAP + VM_STATUS_WIDTH}
              y={VM_STATUS_GAP + VM_STATUS_WIDTH}
            />
            {imageComponent}
            {children}
          </BaseNode>
        </g>
      </Tooltip>
    </g>
  );
};

const VMNode = observer(ObservedVMNode);
export default VMNode;
