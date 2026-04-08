import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { getLabel } from '@kubevirt-utils/resources/shared';
import {
  getTemplateVirtualMachineObject,
  Template,
  WORKLOADS_LABELS,
} from '@kubevirt-utils/resources/template';
import { VM_WORKLOAD_ANNOTATION } from '@kubevirt-utils/resources/vm/utils';

import { ANNOTATIONS, LABELS } from './constants';

export const getAffinity = (template: Template) =>
  getTemplateVirtualMachineObject(template)?.spec?.template?.spec?.affinity || {};

export const getEvictionStrategy = (template: Template): string =>
  getTemplateVirtualMachineObject(template)?.spec?.template?.spec?.evictionStrategy;

export const getNodeSelector = (template: Template) =>
  getTemplateVirtualMachineObject(template)?.spec?.template?.spec?.nodeSelector;

export const getTemplateProviderName = (template: Template): string =>
  getAnnotation(template, ANNOTATIONS.providerName, null) ||
  getLabel(template, LABELS.provider, null) ||
  getAnnotation(template, ANNOTATIONS.providerDisplayName, null);

export const getTemplateWorkload = (template: Template): string =>
  getTemplateVirtualMachineObject(template)?.spec?.template?.metadata?.annotations?.[
    VM_WORKLOAD_ANNOTATION
  ];

export const getTolerations = (template: Template) =>
  getTemplateVirtualMachineObject(template)?.spec?.template?.spec?.tolerations;

// t('Other')
export const getWorkloadProfile = (template: Template): string =>
  WORKLOADS_LABELS[getTemplateWorkload(template)] || 'Other';

export const getVMTemplateBaseName = (template: Template): { name: string; namespace: string } => {
  const name = getLabel(template, LABELS.name);
  const namespace = getLabel(template, LABELS.namespace);

  return name && namespace ? { name, namespace } : null;
};
