import { V1Template } from '@kubevirt-utils/models';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { getLabel } from '@kubevirt-utils/resources/shared';
import {
  getTemplateVirtualMachineObject,
  WORKLOADS_LABELS,
} from '@kubevirt-utils/resources/template';
import { VM_WORKLOAD_ANNOTATION } from '@kubevirt-utils/resources/vm/utils';

import { ANNOTATIONS, LABELS } from './constants';

export const getAffinity = (template: V1Template) =>
  getTemplateVirtualMachineObject(template)?.spec?.template?.spec?.affinity || {};

export const getEvictionStrategy = (template: V1Template): string =>
  getTemplateVirtualMachineObject(template)?.spec?.template?.spec?.evictionStrategy;

export const getNodeSelector = (template: V1Template) =>
  getTemplateVirtualMachineObject(template)?.spec?.template?.spec?.nodeSelector;

export const getTemplateProviderName = (template: V1Template): string =>
  getAnnotation(template, ANNOTATIONS.providerName, null) ||
  getAnnotation(template, ANNOTATIONS.providerDisplayName, null);

export const getTemplateWorkload = (template: V1Template): string =>
  getTemplateVirtualMachineObject(template)?.spec?.template?.metadata?.annotations?.[
    VM_WORKLOAD_ANNOTATION
  ];

export const getTolerations = (template: V1Template) =>
  getTemplateVirtualMachineObject(template)?.spec?.template?.spec?.tolerations;

// t('Other')
export const getWorkloadProfile = (template: V1Template): string =>
  WORKLOADS_LABELS[getTemplateWorkload(template)] || 'Other';

export const getVMTemplateBaseName = (
  template: V1Template,
): { name: string; namespace: string } => {
  const name = getLabel(template, LABELS.labelName);
  const namespace = getLabel(template, LABELS.labelNamespace);

  return name && namespace ? { name, namespace } : null;
};
