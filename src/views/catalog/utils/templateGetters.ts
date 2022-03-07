import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getAnnotation } from '@kubevirt-utils/resources/shared';

import { ANNOTATIONS } from './annotations';
import {
  TEMPLATE_BASE_IMAGE_NAME_PARAMETER,
  TEMPLATE_DATA_SOURCE_NAME_PARAMETER,
} from './constants';

export const getTemplateParameterValue = (template: V1Template, parameter): string => {
  return template?.parameters?.find((param) => param.name === parameter)?.value ?? '';
};

export const getTemplateDocumentationURL = (template: V1Template): string =>
  getAnnotation(template, ANNOTATIONS.documentationURL);

export const getTemplateName = (template: V1Template): string =>
  getAnnotation(template, ANNOTATIONS.displayName, template?.metadata?.name);

export const getTemplatePVCName = (template: V1Template): string =>
  getTemplateParameterValue(template, TEMPLATE_BASE_IMAGE_NAME_PARAMETER) ||
  getTemplateParameterValue(template, TEMPLATE_DATA_SOURCE_NAME_PARAMETER);

export const getTemplateDescription = (template: V1Template): string =>
  getAnnotation(template, ANNOTATIONS.description);

export const getTemplateVirtualMachineObject = (template: V1Template): V1VirtualMachine =>
  template?.objects?.find((obj) => obj.kind === VirtualMachineModel.kind);

export const generateVMName = (template: V1Template): string => {
  return `${getTemplatePVCName(template) ?? template?.metadata?.name}-${uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '-',
  })}`;
};
