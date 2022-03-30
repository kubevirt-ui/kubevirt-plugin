import { V1Template } from '@kubevirt-utils/models';
import { getAnnotation } from '@kubevirt-utils/resources/shared';

import { ANNOTATIONS } from './constants';

export const getTemplateProviderName = (template: V1Template): string =>
  getAnnotation(template, ANNOTATIONS.providerName, template?.metadata?.name);
