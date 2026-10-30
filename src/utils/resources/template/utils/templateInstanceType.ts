import produce from 'immer';

import {
  VirtualMachineClusterInstancetypeModel,
  VirtualMachineInstancetypeModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getInstanceTypeMatcherNamespace,
  getInstanceTypeModelFromMatcher,
} from '@kubevirt-utils/resources/instancetype/helper';
import { type InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getInstanceTypeMatcher } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';

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

const findClusterInstanceType = (
  instanceTypes: InstanceTypeUnion[],
  name: string,
): InstanceTypeUnion | undefined =>
  instanceTypes.find(
    (instanceType) =>
      instanceType.kind === VirtualMachineClusterInstancetypeModel.kind &&
      getName(instanceType) === name,
  );

const findNamespacedInstanceType = (
  instanceTypes: InstanceTypeUnion[],
  name: string,
  namespace: string | undefined,
): InstanceTypeUnion | undefined => {
  const isNamespacedKind = (instanceType: InstanceTypeUnion): boolean =>
    instanceType.kind === VirtualMachineInstancetypeModel.kind ||
    Boolean(instanceType.kind && !instanceType.kind.includes('cluster'));

  const matchesName = (instanceType: InstanceTypeUnion): boolean =>
    isNamespacedKind(instanceType) && getName(instanceType) === name;

  if (namespace) {
    return instanceTypes.find(
      (instanceType) => matchesName(instanceType) && getNamespace(instanceType) === namespace,
    );
  }

  const matches = instanceTypes.filter(matchesName);
  return matches.length === 1 ? matches[0] : undefined;
};

const getTemplateInstanceTypeNamespace = (
  template: Template,
  vm: V1VirtualMachine,
  matcher: NonNullable<ReturnType<typeof getInstanceTypeMatcher>>,
): string | undefined =>
  getInstanceTypeMatcherNamespace(matcher) ?? getNamespace(vm) ?? getNamespace(template);

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

  const namespace = getTemplateInstanceTypeNamespace(template, vm, matcher);
  const instanceTypeModel = getInstanceTypeModelFromMatcher(matcher);

  if (instanceTypeModel.kind === VirtualMachineInstancetypeModel.kind) {
    return findNamespacedInstanceType(instanceTypes, resolvedName, namespace);
  }

  const clusterMatch = findClusterInstanceType(instanceTypes, resolvedName);
  if (clusterMatch) {
    return clusterMatch;
  }

  // Matcher kind omitted (defaults to cluster) but name may refer to a namespaced CR.
  if (isEmpty(matcher.kind)) {
    return findNamespacedInstanceType(instanceTypes, resolvedName, namespace);
  }

  return undefined;
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
