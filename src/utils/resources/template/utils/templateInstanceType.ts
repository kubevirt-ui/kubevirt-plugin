import produce from 'immer';

import {
  VirtualMachineClusterInstancetypeModel,
  VirtualMachineInstancetypeModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getInstanceTypeModelFromMatcher } from '@kubevirt-utils/resources/instancetype/helper';
import { type InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getInstanceTypeMatcher } from '@kubevirt-utils/resources/vm';

import { updateTemplate } from './helpers';
import { extractParameterName } from './parameters';
import { getParameters, getTemplateVirtualMachineObject } from './selectors';
import { type Template } from './types';

/**
 * Returns true if the template uses an instancetype reference.
 */
export const isTemplateWithInstanceType = (template: Template): boolean => {
  const vm = getTemplateVirtualMachineObject(template);
  return !!getInstanceTypeMatcher(vm);
};

/**
 * Resolves the actual instancetype name for a template by looking up the parameter value
 * when the instancetype name uses a `${PARAM}` reference, or returns the name directly.
 */
export const getResolvedInstanceTypeName = (template: Template): string | undefined => {
  const vm = getTemplateVirtualMachineObject(template);
  const matcher = getInstanceTypeMatcher(vm);
  const rawName = matcher?.name;

  if (!rawName) return undefined;

  const paramName = extractParameterName(rawName);
  if (!paramName) return rawName;

  return getParameters(template)?.find((param) => param.name === paramName)?.value;
};

/** Resolves the instance type CR referenced by a template (cluster or namespaced). */
export const findInstanceTypeForTemplate = (
  template: Template,
  instanceTypes: InstanceTypeUnion[],
): InstanceTypeUnion | undefined => {
  if (!isTemplateWithInstanceType(template)) {
    return undefined;
  }

  const vm = getTemplateVirtualMachineObject(template);
  const matcher = getInstanceTypeMatcher(vm);
  const resolvedName = getResolvedInstanceTypeName(template);

  if (!matcher || !resolvedName) {
    return undefined;
  }

  const instanceTypeModel = getInstanceTypeModelFromMatcher(matcher);

  if (instanceTypeModel.kind === VirtualMachineInstancetypeModel.kind) {
    const namespace = getNamespace(vm) ?? getNamespace(template);

    return instanceTypes.find(
      (instanceType) =>
        instanceType.kind === VirtualMachineInstancetypeModel.kind &&
        getName(instanceType) === resolvedName &&
        getNamespace(instanceType) === namespace,
    );
  }

  return instanceTypes.find(
    (instanceType) =>
      instanceType.kind === VirtualMachineClusterInstancetypeModel.kind &&
      getName(instanceType) === resolvedName,
  );
};

/**
 * Creates an onSubmit handler for the InstanceTypeModal that updates the template parameter
 * (or direct instancetype name) when the user selects a new cluster instancetype.
 */
export const createTemplateInstanceTypeSubmit =
  (template: Template) =>
  async (_vm: V1VirtualMachine, instanceType: InstanceTypeUnion): Promise<V1VirtualMachine> => {
    const vm = getTemplateVirtualMachineObject(template);
    const matcher = getInstanceTypeMatcher(vm);
    const rawName = matcher?.name;
    const paramName = rawName ? extractParameterName(rawName) : undefined;
    const newName = getName(instanceType);

    const updatedTemplate = produce(template, (draft) => {
      if (paramName) {
        const param = getParameters(draft)?.find((par) => par.name === paramName);
        if (param) {
          param.value = newName;
        }
        return;
      }

      const draftVM = getTemplateVirtualMachineObject(draft);
      if (draftVM?.spec?.instancetype) {
        draftVM.spec.instancetype.name = newName;
      }
    });

    await updateTemplate(updatedTemplate);
    return vm;
  };
