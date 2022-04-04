import { V1Template } from '@kubevirt-utils/models';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { VM_WORKLOAD_ANNOTATION } from '@kubevirt-utils/resources/vm/utils';

import { ANNOTATIONS } from './constants';

export const getTemplateProviderName = (template: V1Template): string =>
  getAnnotation(template, ANNOTATIONS.providerName, template?.metadata?.name);

export const getTemplateWorkload = (template: V1Template): string =>
  template?.objects[0]?.spec?.template?.metadata?.annotations?.[VM_WORKLOAD_ANNOTATION];
