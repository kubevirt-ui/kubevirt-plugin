import type { Template } from '@kubevirt-utils/resources/template';

export type TemplateSchedulingGridProps = {
  editable: boolean;
  template: Template;
};

export type TemplateSchedulingGridDetailsProps = TemplateSchedulingGridProps & {
  onSubmit: (updatedTemplate: Template) => Promise<Template | void>;
};
