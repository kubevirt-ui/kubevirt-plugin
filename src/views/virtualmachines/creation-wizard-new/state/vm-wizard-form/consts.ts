import { FieldPath } from 'react-hook-form';

import { VMWizardFormValues } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/types';

export const CREATE_VM_FORM_FIELDS_VM_DATA: Record<string, FieldPath<VMWizardFormValues>> = {
  CLUSTER: 'vmData.cluster',
  CREATION_METHOD: 'vmData.creationMethod',
  DESCRIPTION: 'vmData.description',
  FOLDER: 'vmData.folder',
  NAME: 'vmData.name',
  PROJECT: 'vmData.project',
  ROOT: 'vmData',
  SELECTED_TEMPLATE: 'vmData.selectedTemplate',
};

export const CREATE_VM_FORM_FIELDS_UI_STATE: Record<string, FieldPath<VMWizardFormValues>> = {
  IS_TEMPLATES_DRAWER_OPEN: 'uiState.isTemplatesDrawerOpen',
  LAST_PROCESSED_TEMPLATE_KEY: 'uiState.lastProcessedTemplateKey',
  SHOULD_CHECK_VM_NAME_PROPERLY: 'uiState.shouldCheckVMNameProperly',
};

export const CREATE_VM_FORM_FIELDS_STEP_NAVIGATION: Record<
  string,
  FieldPath<VMWizardFormValues>
> = {
  VISITED_STEPS: 'stepNavigation.visitedSteps',
};
