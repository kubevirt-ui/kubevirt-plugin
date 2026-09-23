import { useMemo } from 'react';

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
import useMultipleAccessReviews from '@kubevirt-utils/hooks/useMultipleAccessReviews';
import { getAllowedResources, getAllowedTemplateResources } from '@kubevirt-utils/resources/shared';
import { TEMPLATE_TYPE_LABEL } from '@kubevirt-utils/resources/template';
import {
  AccessReviewResourceAttributes,
  K8sModel,
  K8sVerb,
} from '@openshift-console/dynamic-plugin-sdk';

import { useProjectNames } from './useProjectNames';

type AccessReviewResult = { allowed: boolean; resourceAttributes: AccessReviewResourceAttributes };

const buildListAccessReviewAttributes = (
  namespaces: string[],
  model: K8sModel,
): AccessReviewResourceAttributes[] =>
  (namespaces || []).map((namespace) => ({
    group: model.apiGroup,
    namespace,
    resource: model.plural,
    verb: 'list' as K8sVerb,
  }));

// Drops namespaces the user can't list the resource in, even if the Project is visible.
const filterAllowedNamespaces = (accessReviews: AccessReviewResult[]): string[] =>
  (accessReviews || [])
    .filter((review) => review.allowed)
    .map((review) => review.resourceAttributes?.namespace)
    .filter(Boolean);

const useNonAdminResourcesInventoryCard = () => {
  const projectNames = useProjectNames();

  const vmAccessReviewAttributes = useMemo(
    () => buildListAccessReviewAttributes(projectNames, VirtualMachineModel),
    [projectNames],
  );
  const templateAccessReviewAttributes = useMemo(
    () => buildListAccessReviewAttributes(projectNames, TemplateModel),
    [projectNames],
  );
  const nadAccessReviewAttributes = useMemo(
    () => buildListAccessReviewAttributes(projectNames, NetworkAttachmentDefinitionModel),
    [projectNames],
  );

  const [vmAccessReviews] = useMultipleAccessReviews(vmAccessReviewAttributes);
  const [templateAccessReviews] = useMultipleAccessReviews(templateAccessReviewAttributes);
  const [nadAccessReviews] = useMultipleAccessReviews(nadAccessReviewAttributes);

  const allowedVMNamespaces = useMemo(
    () => filterAllowedNamespaces(vmAccessReviews),
    [vmAccessReviews],
  );
  const allowedTemplateNamespaces = useMemo(
    () => filterAllowedNamespaces(templateAccessReviews),
    [templateAccessReviews],
  );
  const allowedNADNamespaces = useMemo(
    () => filterAllowedNamespaces(nadAccessReviews),
    [nadAccessReviews],
  );

  const allowedVMResources = getAllowedResources(allowedVMNamespaces, VirtualMachineModel);
  const allowedNADResources = getAllowedResources(
    allowedNADNamespaces,
    NetworkAttachmentDefinitionModel,
  );
  const allowedTemplateResources = getAllowedTemplateResources(allowedTemplateNamespaces);

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
