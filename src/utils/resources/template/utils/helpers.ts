import produce from 'immer';

import {
  TemplateModel,
  type TemplateParameter,
  type V1Template,
  VirtualMachineTemplateModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type V1beta1VirtualMachineTemplateSpecParameters } from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import { logTemplateEdited } from '@kubevirt-utils/extensions/telemetry/templates';
import { getAnnotation, getLabels, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  isOpenShiftTemplate,
  isVirtualMachineTemplate,
  type Template,
} from '@kubevirt-utils/resources/template';
import { vmBootDiskSourceIsRegistry } from '@kubevirt-utils/resources/vm/utils/source';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sUpdate } from '@multicluster/k8sRequests';
import { type K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { ANNOTATIONS } from './annotations';
import {
  GENERATE_VM_PRETTY_NAME_ANNOTATION,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
} from './constants';
import { getParameters, getTemplatePVCName, getTemplateVirtualMachineObject } from './selectors';

// Only used for replacing parameters in the template, do not use for anything else
export const poorManProcess = (template: V1Template): V1Template => {
  if (!template) return null;

  let templateString = JSON.stringify(template);

  const filteredParams = template?.parameters?.filter((param) => param.value) ?? [];
  for (const param of filteredParams) {
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
    const sorted = parameters?.reduce<TemplateParameter[]>(
      (acc, param) => (param?.name === 'NAME' ? acc.unshift(param) : acc.push(param)) && acc,
      [],
    );
    const [nameParam, ...restParams] = sorted;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return [...restParams, generateVMNamePrettyParam(template) ?? nameParam];
  }
  return [];
};

export const replaceTemplateParameters = (
  template: Template,
  parameters: TemplateParameter[] | V1beta1VirtualMachineTemplateSpecParameters[],
): Template =>
  produce(template, (draftTemplate) => {
    if (isOpenShiftTemplate(draftTemplate)) draftTemplate.parameters = parameters;
    if (isVirtualMachineTemplate(draftTemplate))
      draftTemplate.spec.parameters = parameters as V1beta1VirtualMachineTemplateSpecParameters[];
  });

export const createTemplateDraft = (
  template: Template,
  namespace: string,
  parameters: TemplateParameter[] | V1beta1VirtualMachineTemplateSpecParameters[],
): Template =>
  produce(template, (draftTemplate) => {
    if (isOpenShiftTemplate(draftTemplate)) draftTemplate.parameters = parameters;
    if (isVirtualMachineTemplate(draftTemplate))
      draftTemplate.spec.parameters = parameters as V1beta1VirtualMachineTemplateSpecParameters[];

    draftTemplate.metadata = { ...draftTemplate.metadata, namespace };
  });

export const bootDiskSourceIsRegistry = (template: V1Template): boolean => {
  const vmObject: V1VirtualMachine = getTemplateVirtualMachineObject(template);
  return vmBootDiskSourceIsRegistry(vmObject);
};

export { createProcessedTemplate } from './processTemplate';

export const getTemplateModel = (template: Template): K8sModel =>
  isVirtualMachineTemplate(template) ? VirtualMachineTemplateModel : TemplateModel;

export const updateTemplate = async (template: Template): Promise<Template> => {
  const model = getTemplateModel(template);
  const result = await kubevirtK8sUpdate({
    cluster: getCluster(template),
    data: template,
    model,
    name: getName(template),
    ns: getNamespace(template),
  });
  logTemplateEdited(template);
  return result;
};

export { isValidTemplateIconUrl } from './templateUrlValidation';
