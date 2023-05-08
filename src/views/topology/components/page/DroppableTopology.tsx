import { DropTarget, DropTargetConnector, DropTargetMonitor } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';

import { boxTarget } from './DroppableTopology/utils/utils';
import TopologyView, { TopologyViewProps } from './TopologyView';

const DroppableTopology = DropTarget(
  NativeTypes.FILE,
  boxTarget,
  (connectObj: DropTargetConnector, monitor: DropTargetMonitor, props: TopologyViewProps) => {
    return {
      connectDropTarget: connectObj.dropTarget(),
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop() && props.canDropFile,
    };
  },
)(TopologyView);

export default DroppableTopology;
