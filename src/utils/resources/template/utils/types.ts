import {
  TemplateModel,
  V1Template,
  VirtualMachineTemplateModel,
  VirtualMachineTemplateRequestModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  V1alpha1VirtualMachineTemplate,
  V1alpha1VirtualMachineTemplateRequest,
} from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import { ObjectMetadata } from '@openshift-console/dynamic-plugin-sdk';

export type Template = V1alpha1VirtualMachineTemplate | V1Template;

export type TemplateOrRequest = Template | V1alpha1VirtualMachineTemplateRequest;

export type ProcessOptions = {
  apiVersion: string;
  kind: string;
  metadata?: ObjectMetadata;
  parameters?: Record<string, string>;
};

export type ProcessedVirtualMachineTemplate = {
  apiVersion: string;
  kind: string;
  message?: string;
  metadata?: ObjectMetadata;
  templateRef?: { name: string; namespace: string };
  virtualMachine: V1VirtualMachine;
};

export const isVirtualMachineTemplate = (
  obj: TemplateOrRequest,
): obj is V1alpha1VirtualMachineTemplate => obj?.kind === VirtualMachineTemplateModel.kind;

export const isVirtualMachineTemplateRequest = (
  obj: TemplateOrRequest,
): obj is V1alpha1VirtualMachineTemplateRequest =>
  obj?.kind === VirtualMachineTemplateRequestModel.kind;

export const isOpenShiftTemplate = (obj: TemplateOrRequest): obj is V1Template =>
  obj?.kind === TemplateModel.kind;
