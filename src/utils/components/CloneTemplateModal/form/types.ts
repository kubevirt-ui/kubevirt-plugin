import { type Template } from '@kubevirt-utils/resources/template';

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
  IsCloneStorageEnabled = 'isCloneStorageEnabled',
  PvcName = 'pvcName',
  SourceProject = 'sourceProject',
  TargetProject = 'targetProject',
  Template = 'template',
  TemplateDisplayName = 'templateDisplayName',
  TemplateName = 'templateName',
  TemplateProvider = 'templateProvider',
}
