import produce from 'immer';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getAnnotation } from '@kubevirt-utils/resources/shared';

import { ANNOTATIONS } from './annotations';

// Only used for replacing parameters in the template, do not use for anything else
// eslint-disable-next-line require-jsdoc
export const poorManProcess = (template: V1Template): V1Template => {
  if (!template) return null;

  let templateString = JSON.stringify(template);

  template?.parameters
    ?.filter((p) => p.value)
    ?.forEach((p) => {
      templateString = templateString.replaceAll(`\${${p?.name}}`, p?.value);
    });

  return JSON.parse(templateString);
};

export const isDeprecatedTemplate = (template: V1Template): boolean =>
  getAnnotation(template, ANNOTATIONS.deprecated) === 'true';

export const replaceTemplateVM = (template: V1Template, vm: V1VirtualMachine) => {
  const vmIndex = template.objects?.findIndex((object) => object.kind === VirtualMachineModel.kind);

  return produce(template, (draftTemplate) => {
    draftTemplate.objects.splice(vmIndex, 1, vm);
  });
};
