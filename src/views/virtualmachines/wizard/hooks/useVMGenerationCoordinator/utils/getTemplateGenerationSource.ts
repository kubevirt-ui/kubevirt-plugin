import cloneDeep from 'lodash/cloneDeep';

import { getResourceKey } from '@kubevirt-utils/resources/shared';
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

export type TemplateGeneratedDraftSource = Omit<
  TemplateGenerationSource,
  'description' | 'folder' | 'selectedTemplate'
> & {
  templateKey: string;
};

/**
 * Values that identify the generated VM structure. Description and folder are intentionally
 * excluded because their editors patch the current VM draft directly; changing either must not
 * regenerate the template and overwrite unrelated customizations.
 */
export const getTemplateGeneratedDraftSource = (
  source: TemplateGenerationSource,
): TemplateGeneratedDraftSource => {
  const {
    description: _description,
    folder: _folder,
    selectedTemplate,
    ...generationInputs
  } = source;

  return {
    ...generationInputs,
    templateKey: getResourceKey(selectedTemplate),
  };
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
