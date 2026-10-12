import type { V1ObjectMeta } from '@kubernetes/client-node';

export type K8sPod = {
  metadata?: V1ObjectMeta;
  spec?: {
    nodeName?: string;
  };
  status?: {
    phase?: string;
  };
};

export type K8sNode = {
  metadata?: V1ObjectMeta;
  status?: {
    conditions?: Array<{ status: string; type: string }>;
    nodeInfo?: { kubeletVersion?: string };
  };
};

export type K8sEvent = {
  lastTimestamp?: string;
  message?: string;
  reason?: string;
  type?: string;
};
