import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  K8sResourceCommon,
  ResourcesObject,
  WatchK8sResults,
} from '@openshift-console/dynamic-plugin-sdk';

import { K8sResourceKind } from '../../details-card/utils/types';

// The config is a JSON object with the NetworkAttachmentDefinitionConfig type stored as a string
export type NetworkAttachmentDefinitionSpec = {
  config: string;
};

export type NetworkAttachmentDefinitionKind = {
  spec?: NetworkAttachmentDefinitionSpec;
} & K8sResourceKind;

export type InventoryCardResources = {
  vms: V1VirtualMachine[];
  vmTemplates: V1Template[];
  vmCommonTemplates: V1Template[];
  nodes: IoK8sApiCoreV1Node[];
  nads: NetworkAttachmentDefinitionKind[];
};

export type VMILikeEntityKind = V1VirtualMachine | V1VirtualMachineInstance;
export type VMLikeEntityKind = V1VirtualMachine | V1Template;
export type VMGenericLikeEntityKind = VMLikeEntityKind | VMILikeEntityKind;

export type TemplateItem = {
  metadata: {
    name: string;
    uid: string;
    namespace: string;
  };
  isCommon: boolean;
  variants: V1Template[];
};

export type VirtualMachineTemplateBundle = {
  template?: TemplateItem;
  customizeTemplate?: {
    vm: V1VirtualMachine;
    template: V1Template;
  };
};

export type Flatten<
  F extends ResourcesObject = { [key: string]: K8sResourceCommon | K8sResourceCommon[] },
  R = any,
> = (resources: WatchK8sResults<F>) => R;
