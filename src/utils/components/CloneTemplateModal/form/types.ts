import { Template } from '@kubevirt-utils/resources/template';

export type CloneTemplateFormValues = {
  isCloneStorageEnabled: boolean;
  pvcName: string;
  sourceProject: string;
  targetProject: string;
  template: Template | undefined;
  templateDisplayName: string;
  templateName: string;
  templateProvider: string;
};

export enum CloneTemplateField {
  isCloneStorageEnabled = 'isCloneStorageEnabled',
  pvcName = 'pvcName',
  sourceProject = 'sourceProject',
  targetProject = 'targetProject',
  template = 'template',
  templateDisplayName = 'templateDisplayName',
  templateName = 'templateName',
  templateProvider = 'templateProvider',
}
