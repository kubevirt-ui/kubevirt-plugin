import produce from 'immer';

import {
  type TemplateParameter,
  type V1Template,
  VirtualMachineModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getAnnotation, getLabels } from '@kubevirt-utils/resources/shared';
import {
  getParameters,
  isVirtualMachineTemplate,
  type Template,
} from '@kubevirt-utils/resources/template';
import { vmBootDiskSourceIsRegistry } from '@kubevirt-utils/resources/vm/utils/source';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { ANNOTATIONS } from './annotations';
import {
  GENERATE_VM_PRETTY_NAME_ANNOTATION,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
} from './constants';
import { getTemplatePVCName, getTemplateVirtualMachineObject } from './selectors';

export {
  createProcessedTemplate,
  createTemplateDraft,
  getTemplateModel,
  replaceTemplateParameters,
  updateTemplate,
} from './templateOperations';

// Only used for replacing parameters in the template, do not use for anything else

export const poorManProcess = (template: V1Template): V1Template => {
  if (!template) return null;

  let templateString = JSON.stringify(template);

  const params = template?.parameters?.filter((param) => param.value) ?? [];
  for (const param of params) {
    templateString = templateString.replaceAll(`\${${param?.name}}`, param?.value);
  }

  return JSON.parse(templateString);
};

export const isCommonTemplate = (template: Template): boolean =>
  getLabels(template)?.[TEMPLATE_TYPE_LABEL] === TEMPLATE_TYPE_BASE;

export const isDeprecatedTemplate = (template: K8sResourceCommon): boolean =>
  getAnnotation(template, ANNOTATIONS.deprecated) === 'true';

export const replaceTemplateVM = (template: Template, vm: V1VirtualMachine): Template => {
  if (isVirtualMachineTemplate(template)) {
    return produce(template, (draftTemplate) => {
      draftTemplate.spec.virtualMachine = vm;
    });
  }

  const osTemplate = template as V1Template;
  const vmIndex = osTemplate.objects?.findIndex(
    (object) => object.kind === VirtualMachineModel.kind,
  );

  return produce(osTemplate, (draftTemplate) => {
    draftTemplate.objects.splice(vmIndex, 1, vm);
  });
};

/**
 * A function for generating a unique vm name
 * @param {Template} template - template
 * @returns a unique vm name
 */
export const generateVMName = (template: Template): string => {
  return generatePrettyName(getTemplatePVCName(template) || template?.metadata?.name);
};

export const generateVMNamePrettyParam = (template: Template): TemplateParameter | undefined => {
  if (getAnnotation(template, GENERATE_VM_PRETTY_NAME_ANNOTATION)) {
    return { description: 'VM name', name: 'NAME', value: generateVMName(template) };
  }
};

export const generateParamsWithPrettyName = (template: Template): TemplateParameter[] => {
  const parameters = getParameters(template);
  if (parameters) {
    const templateParams = parameters as TemplateParameter[];
    const sorted: TemplateParameter[] = templateParams.reduce<TemplateParameter[]>(
      (acc, param) => (param?.name === 'NAME' ? acc.unshift(param) : acc.push(param)) && acc,
      [],
    );
    const [nameParam, ...restParams] = sorted;
    return [...restParams, generateVMNamePrettyParam(template) ?? nameParam];
  }
  return [];
};

export const bootDiskSourceIsRegistry = (template: V1Template): boolean => {
  const vmObject: V1VirtualMachine = getTemplateVirtualMachineObject(template);
  return vmBootDiskSourceIsRegistry(vmObject);
};

const canParseUrl = (url: string): boolean => {
  if (URL?.canParse) {
    return URL.canParse(url);
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidTemplateIconUrl = (url: string): boolean => {
  if (!url) return false;

  // Allow relative paths starting with /
  if (/^\/[^/]/.test(url)) {
    return true;
  }

  // For absolute URLs, validate using canParseUrl helper and check protocol
  if (canParseUrl(url)) {
    try {
      const parsedUrl = new URL(url);
      // Only allow http, https protocols (block javascript:, data:, vbscript:, etc.)
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }

  return false;
};
