import produce from 'immer';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import { TemplateParameter, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getAnnotation } from '@kubevirt-utils/resources/shared';

import { ANNOTATIONS } from './annotations';
import { GENERATE_VM_PRETTY_NAME_ANNOTATION } from './constants';
import { getTemplatePVCName } from './selectors';

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

/**
 * A function for generating a unique vm name
 * @param {V1Template} template - template
 * @returns a unique vm name
 */
export const generateVMName = (template: V1Template): string => {
  return `${getTemplatePVCName(template) || template?.metadata?.name}-${uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '-',
  })}`;
};

export const generateVMNamePrettyParam = (template: V1Template): TemplateParameter => {
  if (getAnnotation(template, GENERATE_VM_PRETTY_NAME_ANNOTATION)) {
    return { name: 'NAME', description: 'VM name', value: generateVMName(template) };
  }
};

export const generateParamsWithPrettyName = (template: V1Template) => {
  if (template?.parameters) {
    const [nameParam, ...restParams] = template?.parameters?.reduce(
      (acc: TemplateParameter[], param) =>
        (param?.name === 'NAME' ? acc.unshift(param) : acc.push(param)) && acc,
      [],
    );
    return [...restParams, generateVMNamePrettyParam(template) ?? nameParam];
  }
  return [];
};

export const hasTemplateParameter = (stringToTest: string) => /[${}]/.test(stringToTest);
