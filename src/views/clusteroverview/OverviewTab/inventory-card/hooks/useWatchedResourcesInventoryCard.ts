import {
  modelToGroupVersionKind,
  NodeModel,
  TemplateModel,
} from '@kubevirt-ui/kubevirt-api/console';
import NetworkAttachmentDefinitionModel, {
  NetworkAttachmentDefinitionModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console/models/NetworkAttachmentDefinitionModel';
import VirtualMachineModel, {
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { getAllowedResources, getAllowedTemplateResources } from '@kubevirt-utils/resources/shared';
import { TEMPLATE_TYPE_LABEL } from '@kubevirt-utils/resources/template';

import { useProjectNames } from './useProjectNames';

const useNonAdminResourcesInventoryCard = () => {
  const projectNames = useProjectNames();
  const allowedVMResources = getAllowedResources(projectNames, VirtualMachineModel);
  const allowedNADResources = getAllowedResources(projectNames, NetworkAttachmentDefinitionModel);
  const allowedTemplateResources = getAllowedTemplateResources(projectNames);

  const watchedResources = {
    ...allowedVMResources,
    ...allowedTemplateResources,
    nodes: {
      groupVersionKind: modelToGroupVersionKind(NodeModel),
      isList: true,
      namespaced: false,
    },
    ...allowedNADResources,
  };
  return watchedResources;
};

const useAdminResourcesInventoryCard = () => {
  return {
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
};

export const useWatchedResourcesHook = (isAdmin: boolean) => {
  return isAdmin ? useAdminResourcesInventoryCard : useNonAdminResourcesInventoryCard;
};
