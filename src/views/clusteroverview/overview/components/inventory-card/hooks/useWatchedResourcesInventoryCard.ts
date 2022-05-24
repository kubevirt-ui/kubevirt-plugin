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
import { TEMPLATE_TYPE_LABEL } from '@kubevirt-utils/resources/template';

import { getAllowedResources, getAllowedTemplateResources } from '../../../utils/utils';

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
      namespaced: false,
      isList: true,
    },
    ...allowedNADResources,
  };
  return watchedResources;
};

const useAdminResourcesInventoryCard = () => {
  return {
    vms: {
      groupVersionKind: VirtualMachineModelGroupVersionKind,
      namespaced: true,
      isList: true,
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
    nodes: {
      groupVersionKind: modelToGroupVersionKind(NodeModel),
      namespaced: false,
      isList: true,
    },
    nads: {
      groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
      namespaced: false,
      isList: true,
    },
  };
};

export const useWatchedResourcesHook = (isAdmin: boolean) => {
  return isAdmin ? useAdminResourcesInventoryCard : useNonAdminResourcesInventoryCard;
};
