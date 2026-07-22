export const TEMPLATE_TYPE_ID = {
  OPENSHIFT: 'templates',
  VM: 'vm-templates',
} as const;

export type TemplateTypeId = (typeof TEMPLATE_TYPE_ID)[keyof typeof TEMPLATE_TYPE_ID];
