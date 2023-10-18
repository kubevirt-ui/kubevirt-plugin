import { IoK8sApiextensionsApiserverPkgApisApiextensionsV1CustomResourceDefinitionCondition } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const NodeModel = {
  abbr: 'N',
  apiVersion: 'v1',
  id: 'node',
  kind: 'Node',
  label: 'Node',
  labelKey: 'Node',
  labelPlural: 'Nodes',
  labelPluralKey: 'Nodes',
  plural: 'nodes',
};

export type NodeCondition = {
  lastHeartbeatTime?: string;
} & IoK8sApiextensionsApiserverPkgApisApiextensionsV1CustomResourceDefinitionCondition;

export type TaintEffect = '' | 'NoExecute' | 'NoSchedule' | 'PreferNoSchedule';

export type Taint = {
  effect: TaintEffect;
  key: string;
  value: string;
};

export type V1Node = {
  spec: {
    taints?: Taint[];
    unschedulable?: boolean;
  };
  status?: {
    capacity?: {
      [key: string]: string;
    };
    conditions?: NodeCondition[];
    images?: {
      names: string[];
      sizeBytes?: number;
    }[];
    nodeInfo?: {
      operatingSystem: string;
    };
    phase?: string;
  };
} & K8sResourceCommon;
