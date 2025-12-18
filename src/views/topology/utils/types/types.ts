import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  OdcNodeModel,
  TopologyDataObject,
} from '@openshift-console/dynamic-plugin-sdk/lib/extensions/topology-types';
import { Node } from '@patternfly/react-topology';

export type VMNodeData = {
  kind: string;
  osImage: string;
  vmi: V1VirtualMachineInstance;
  vmStatus: string;
};

export type VMNode = Node<OdcNodeModel, TopologyDataObject<VMNodeData>>;
