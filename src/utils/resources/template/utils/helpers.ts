import { SetStateAction } from 'react';
import produce from 'immer';

import {
  ProcessedTemplatesModel,
  TemplateModel,
  TemplateParameter,
  V1Template,
  VirtualMachineTemplateRequestModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { V1alpha1VirtualMachineTemplateSpecParameters } from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import { getAnnotation, getLabels, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  getParameters,
  isOpenShiftTemplate,
  isVirtualMachineTemplate,
  Template,
} from '@kubevirt-utils/resources/template';
import { vmBootDiskSourceIsRegistry } from '@kubevirt-utils/resources/vm/utils/source';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate, kubevirtK8sUpdate } from '@multicluster/k8sRequests';

import { ANNOTATIONS } from './annotations';
import {
  GENERATE_VM_PRETTY_NAME_ANNOTATION,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
} from './constants';
import { getTemplatePVCName, getTemplateVirtualMachineObject } from './selectors';

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

export const isCommonTemplate = (template: Template): boolean =>
  getLabels(template)?.[TEMPLATE_TYPE_LABEL] === TEMPLATE_TYPE_BASE;

export const isDeprecatedTemplate = (template: K8sResourceCommon): boolean =>
  getAnnotation(template, ANNOTATIONS.deprecated) === 'true';

export const replaceTemplateVM = (template: V1Template, vm: V1VirtualMachine) => {
  const vmIndex = template.objects?.findIndex((object) => object.kind === VirtualMachineModel.kind);

  return produce(template, (draftTemplate) => {
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

export const generateVMNamePrettyParam = (template: Template): TemplateParameter => {
  if (getAnnotation(template, GENERATE_VM_PRETTY_NAME_ANNOTATION)) {
    return { description: 'VM name', name: 'NAME', value: generateVMName(template) };
  }
};

export const generateParamsWithPrettyName = (template: Template) => {
  const parameters = getParameters(template);
  if (parameters) {
    const [nameParam, ...restParams] = parameters?.reduce(
      (acc: TemplateParameter[], param) =>
        (param?.name === 'NAME' ? acc.unshift(param) : acc.push(param)) && acc,
      [],
    );
    return [...restParams, generateVMNamePrettyParam(template) ?? nameParam];
  }
  return [];
};

export const replaceTemplateParameters = (
  template: Template,
  parameters: TemplateParameter[] | V1alpha1VirtualMachineTemplateSpecParameters[],
) =>
  produce(template, (draftTemplate) => {
    if (isOpenShiftTemplate(draftTemplate)) draftTemplate.parameters = parameters;
    if (isVirtualMachineTemplate(draftTemplate))
      draftTemplate.spec.parameters = parameters as V1alpha1VirtualMachineTemplateSpecParameters[];
  });

export const createTemplateDraft = (
  template: Template,
  namespace: string,
  parameters: TemplateParameter[] | V1alpha1VirtualMachineTemplateSpecParameters[],
) =>
  produce(template, (draftTemplate) => {
    if (isOpenShiftTemplate(draftTemplate)) draftTemplate.parameters = parameters;
    if (isVirtualMachineTemplate(draftTemplate))
      draftTemplate.spec.parameters = parameters as V1alpha1VirtualMachineTemplateSpecParameters[];

    draftTemplate.metadata = { ...draftTemplate.metadata, namespace };
  });

export const bootDiskSourceIsRegistry = (template: V1Template) => {
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

export const updateTemplate = (template: V1Template) => {
  return kubevirtK8sUpdate({
    cluster: getCluster(template),
    data: template,
    model: TemplateModel,
    name: getName(template),
    ns: getNamespace(template),
  });
};

export const createProcessedTemplate = <T extends Template>(
  template: T,
  cluster: string,
  namespace: string,
  excludedParameters: TemplateParameter[],
  setTemplateWithGeneratedValues: (value: SetStateAction<Template>) => void,
  setError: (value: SetStateAction<Error>) => void,
  setLoading: (value: SetStateAction<boolean>) => void,
) => {
  kubevirtK8sCreate<T>({
    cluster,
    data: template,
    model: isOpenShiftTemplate(template)
      ? ProcessedTemplatesModel
      : VirtualMachineTemplateRequestModel,
    ns: namespace,
    queryParams: {
      dryRun: 'All',
    },
  })
    .then((processedTemplate) => {
      const mergedParameters = [...(getParameters(processedTemplate) ?? []), ...excludedParameters];

      setTemplateWithGeneratedValues(replaceTemplateParameters(template, mergedParameters));
      setError(null);
      setLoading(false);
    })
    .catch((apiError) => {
      setTemplateWithGeneratedValues(template);
      setError(apiError);
      setLoading(false);
    });
};
