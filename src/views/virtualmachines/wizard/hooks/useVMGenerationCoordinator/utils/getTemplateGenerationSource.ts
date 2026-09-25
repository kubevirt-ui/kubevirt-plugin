import cloneDeep from 'lodash/cloneDeep';

import { type Template } from '@kubevirt-utils/resources/template';
import { type VMWizardFormValues } from '@virtualmachines/wizard/form/types';

export type TemplateGenerationSource = {
  authorizedSSHKey: string | undefined;
  cluster: string;
  creationMethod: VMWizardFormValues['creationMethod'];
  description: string;
  folder: string;
  generationRevision: number;
  project: string;
  selectedTemplate: Template;
  vmName: string | undefined;
};

export const getTemplateGenerationSource = (
  values: VMWizardFormValues,
  authorizedSSHKey: string | undefined,
  generationRevision: number,
): TemplateGenerationSource | null => {
  if (!values.template.selectedTemplate) return null;

  return {
    authorizedSSHKey,
    cluster: values.deployment.cluster,
    creationMethod: values.creationMethod,
    description: values.deployment.description,
    folder: values.deployment.folder,
    generationRevision,
    project: values.deployment.project,
    selectedTemplate: cloneDeep(values.template.selectedTemplate),
    vmName: values.deployment.name,
  };
};
