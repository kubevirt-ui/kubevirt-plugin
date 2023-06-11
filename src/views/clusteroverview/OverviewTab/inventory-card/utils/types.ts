import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  K8sResourceCommon,
  ResourcesObject,
  WatchK8sResults,
} from '@openshift-console/dynamic-plugin-sdk';

import { K8sResourceKind } from '../../../utils/types';

// The config is a JSON object with the NetworkAttachmentDefinitionConfig type stored as a string
export type NetworkAttachmentDefinitionSpec = {
  config: string;
};

export type NetworkAttachmentDefinitionKind = {
  spec?: NetworkAttachmentDefinitionSpec;
} & K8sResourceKind;

export type InventoryCardResources = {
  nads: NetworkAttachmentDefinitionKind[];
  nodes: IoK8sApiCoreV1Node[];
  vms: V1VirtualMachine[];
  vmTemplates: V1Template[];
};

export type VMILikeEntityKind = V1VirtualMachine | V1VirtualMachineInstance;
export type VMLikeEntityKind = V1Template | V1VirtualMachine;
export type VMGenericLikeEntityKind = VMILikeEntityKind | VMLikeEntityKind;

export type TemplateItem = {
  isCommon: boolean;
  metadata: {
    name: string;
    namespace: string;
    uid: string;
  };
  variants: V1Template[];
};

export type VirtualMachineTemplateBundle = {
  customizeTemplate?: {
    template: V1Template;
    vm: V1VirtualMachine;
  };
  template?: TemplateItem;
};

export type Flatten<
  F extends ResourcesObject = { [key: string]: K8sResourceCommon | K8sResourceCommon[] },
  R = any,
> = (resources: WatchK8sResults<F>) => R;
