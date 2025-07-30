import { NodeStatus } from '@kubevirt-utils/resources/node/utils/types';

export enum MigrationOptions {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
}

export type NodeData = {
  cpuUtilization?: string;
  memoryUtilization?: string;
  metadata: {
    name: string;
  };
  name: string;
  status: NodeStatus;
  totalCPU?: number;
  totalMemory?: number;
  usedCPU?: string;
  usedMemory?: number;
};
