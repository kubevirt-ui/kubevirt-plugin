import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import {
  getTemplateName,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
} from '@kubevirt-utils/resources/template';
import { findKeySuffixValue } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { get } from '@kubevirt-utils/utils/utils';
import { WatchK8sResultsObject } from '@openshift-console/dynamic-plugin-sdk';

import { K8sResourceKind } from '../../../utils/types';

import {
  DEFAULT_OS_VARIANT,
  TEMPLATE_CUSTOMIZED_ANNOTATION,
  TEMPLATE_DEPRECATED_ANNOTATION,
} from './constants';
import {
  Flatten,
  TemplateItem,
  VirtualMachineTemplateBundle,
  VMGenericLikeEntityKind,
} from './types';

export const getLabels = (entity: K8sResourceKind, defaultValue?: { [key: string]: string }) =>
  get(entity, 'metadata.labels', defaultValue);

export const getLoadedData = <T extends K8sResourceKind | K8sResourceKind[] = K8sResourceKind[]>(
  result: WatchK8sResultsObject<T>,
  defaultValue = null,
): T => (result && result.loaded && !result.loadError ? result.data : defaultValue);

export const isCommonTemplate = (template: V1Template): boolean =>
  template?.metadata?.labels?.[TEMPLATE_TYPE_LABEL] === TEMPLATE_TYPE_BASE;

export const isDeprecatedTemplate = (template: V1Template): boolean =>
  getAnnotation(template, TEMPLATE_DEPRECATED_ANNOTATION) === 'true';

export const getWorkloadProfile = (vm: VMGenericLikeEntityKind) =>
  findKeySuffixValue(getLabels(vm), TEMPLATE_WORKLOAD_LABEL);

export const filterTemplates = (templates: V1Template[]): TemplateItem[] => {
  const userTemplateItems: TemplateItem[] = templates
    .filter((t) => !isCommonTemplate(t) && !isDeprecatedTemplate(t))
    .map((t) => ({
      isCommon: false,
      metadata: {
        name: t.metadata.name,
        namespace: t.metadata.namespace,
        uid: t.metadata.uid,
      },
      variants: [t],
    }));

  const commonTemplateItems = templates
    .filter((t) => isCommonTemplate(t) && !isDeprecatedTemplate(t))
    .reduce((acc, t) => {
      const name = getTemplateName(t);
      if (acc[name]) {
        const isRecommended = t.metadata.labels?.[DEFAULT_OS_VARIANT] === 'true';
        if (isRecommended) {
          acc[name].metadata = {
            name: t.metadata.name,
            namespace: t.metadata.namespace,
            uid: t.metadata.uid,
          };
          acc[name].variants.unshift(t);
        } else {
          acc[name].variants.push(t);
        }
      } else {
        acc[name] = {
          isCommon: true,
          metadata: {
            name: t.metadata.name,
            namespace: t.metadata.namespace,
            uid: t.metadata.uid,
          },
          variants: [t],
        };
      }
      return acc;
    }, {} as { [key: string]: TemplateItem });

  Object.keys(commonTemplateItems).forEach((key) => {
    const recommendedProfile = getWorkloadProfile(commonTemplateItems[key].variants[0]);
    commonTemplateItems[key].variants = commonTemplateItems[key].variants.filter(
      (t) => getWorkloadProfile(t) === recommendedProfile,
    );
  });

  return [...userTemplateItems, ...Object.values(commonTemplateItems)];
};

export const flattenTemplates: Flatten<
  { vms: V1VirtualMachine[]; vmTemplates: V1Template[] },
  VirtualMachineTemplateBundle[]
> = ({ vms, vmTemplates }) => {
  const templates = getLoadedData<V1Template[]>(vmTemplates, []);
  return [
    ...getLoadedData<V1VirtualMachine[]>(vms, []).map((vm) => {
      let template: V1Template;
      try {
        template = JSON.parse(vm.metadata.annotations[TEMPLATE_CUSTOMIZED_ANNOTATION]);
      } catch {
        return null;
      }
      return {
        customizeTemplate: {
          template,
          vm,
        },
        metadata: vm.metadata,
      };
    }),
    ...filterTemplates([...templates]).map((template) => ({
      metadata: template.variants[0].metadata,
      template,
    })),
  ].filter((template) => template);
};
