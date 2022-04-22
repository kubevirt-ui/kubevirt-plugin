import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { TEMPLATE_TYPE_BASE, TEMPLATE_TYPE_LABEL } from '@kubevirt-utils/resources/template';

export const isCommonVMTemplate = (template: V1Template): boolean =>
  template?.metadata?.labels?.[TEMPLATE_TYPE_LABEL] === TEMPLATE_TYPE_BASE;
