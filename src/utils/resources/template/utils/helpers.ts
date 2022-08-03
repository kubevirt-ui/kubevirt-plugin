import produce from 'immer';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import {
  getGroupVersionKindForResource,
  k8sCreate,
  K8sModel,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';

import { ANNOTATIONS } from './annotations';

// Only used for replacing parameters in the template, do not use for anything else
// eslint-disable-next-line require-jsdoc
export const poorManProcess = (template: V1Template): V1Template => {
  if (!template) return null;

  let templateString = JSON.stringify(template);

  template.parameters
    .filter((p) => p.value)
    .forEach((p) => {
      templateString = templateString.replaceAll(`\${${p.name}}`, p.value);
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

export const createAllTemplateObjects = (
  template: V1Template,
  models: { [key: string]: K8sModel },
  namespace?: string,
): Promise<K8sResourceCommon[]> =>
  Promise.all(
    template.objects.map((object) => {
      const { group, version, kind } = getGroupVersionKindForResource(object);

      const ref = [group || 'core', version, kind].join('~');

      const model = models[ref] || models[object.kind];

      return k8sCreate<K8sResourceCommon>({
        model: model,
        data: produce(object as K8sResourceCommon, (draftObject) => {
          if (!draftObject.metadata.namespace && namespace) {
            draftObject.metadata.namespace = namespace;
          }
        }),
      });
    }),
  );
