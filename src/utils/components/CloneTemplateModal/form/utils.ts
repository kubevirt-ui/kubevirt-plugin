import { getDisplayName, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { Template } from '@kubevirt-utils/resources/template';
import { getRandomChars } from '@kubevirt-utils/utils/utils';

import { getTemplateBootSourcePVC } from '../utils';

import { CloneTemplateFormValues } from './types';

const getInitialPVCName = (template: Template): string => {
  const pvc = getTemplateBootSourcePVC(template);
  return pvc ? `${pvc.name}-clone` : '';
};

const generateTemplateName = (template: Template): string => {
  return template ? `${getName(template)}-${getRandomChars(9)}` : '';
};

export const getInitialFormValues = (
  template: Template | undefined,
  sourceProject: string,
): CloneTemplateFormValues => {
  return {
    isCloneStorageEnabled: false,
    pvcName: getInitialPVCName(template),
    sourceProject,
    targetProject: getNamespace(template),
    template,
    templateDisplayName: getDisplayName(template) || '',
    templateName: generateTemplateName(template),
    templateProvider: '',
  };
};
