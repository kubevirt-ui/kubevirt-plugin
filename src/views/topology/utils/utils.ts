import { NODE_HEIGHT, NODE_PADDING, NODE_WIDTH, VIRTUAL_MACHINE_TYPE } from './constants';

export const WorkloadModelProps = {
  group: false,
  height: NODE_HEIGHT,
  style: {
    padding: NODE_PADDING,
  },
  visible: true,
  width: NODE_WIDTH,
};

export const isVMType = (type: string) => type === VIRTUAL_MACHINE_TYPE;
