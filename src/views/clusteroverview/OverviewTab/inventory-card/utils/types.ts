import { type V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import {
  type K8sResourceCommon,
  type ResourcesObject,
  type WatchK8sResults,
} from '@openshift-console/dynamic-plugin-sdk';

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
  R = unknown,
> = (resources: WatchK8sResults<F>) => R;
