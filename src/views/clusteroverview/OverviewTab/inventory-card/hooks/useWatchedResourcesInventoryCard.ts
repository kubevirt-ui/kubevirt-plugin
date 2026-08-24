import {
  modelToGroupVersionKind,
  NetworkAttachmentDefinitionModel,
  NetworkAttachmentDefinitionModelGroupVersionKind,
  NodeModel,
  TemplateModel,
  VirtualMachineModel,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { getAllowedResources, getAllowedTemplateResources } from '@kubevirt-utils/resources/shared';
import { TEMPLATE_TYPE_LABEL } from '@kubevirt-utils/resources/template';
import { type WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';

import { useProjectNames } from './useProjectNames';

const adminResources: Record<string, WatchK8sResource> = {
  nads: {
    groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
    isList: true,
    namespaced: false,
  },
  nodes: {
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
    namespaced: false,
  },
  vms: {
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    namespaced: true,
  },
  vmTemplates: {
    groupVersionKind: modelToGroupVersionKind(TemplateModel),
    isList: true,
    selector: {
      matchExpressions: [
        {
          key: TEMPLATE_TYPE_LABEL,
          operator: 'Exists',
        },
      ],
    },
  },
};

export const useWatchedResourcesInventoryCard = (
  isAdmin: boolean,
): Record<string, WatchK8sResource> => {
  const projectNames = useProjectNames();
  const nonAdminResources = {
    ...getAllowedResources(projectNames, VirtualMachineModel),
    ...getAllowedTemplateResources(projectNames),
    nodes: {
      groupVersionKind: modelToGroupVersionKind(NodeModel),
      isList: true,
      namespaced: false,
    },
    ...getAllowedResources(projectNames, NetworkAttachmentDefinitionModel),
  };

  return isAdmin ? adminResources : nonAdminResources;
};
