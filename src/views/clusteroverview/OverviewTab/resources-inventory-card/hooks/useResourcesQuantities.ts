import React, { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  NodeModel,
  TemplateModel,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/NetworkAttachmentDefinitionModel';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { TEMPLATE_TYPE_LABEL } from '@kubevirt-utils/resources/template';
import { K8sResourceCommon, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';

type UseResourcesQuantities = () => {
  loaded: boolean;
  nads: number;
  nodes: number;
  vms: number;
  vmTemplates: number;
};

const useResourcesQuantities: UseResourcesQuantities = () => {
  const [activeNamespace] = useActiveNamespace();
  const namespace = React.useMemo(
    () => (activeNamespace === ALL_NAMESPACES_SESSION_KEY ? null : activeNamespace),
    [activeNamespace],
  );

  const watchedResources = {
    vms: {
      groupVersionKind: VirtualMachineModelGroupVersionKind,
      namespaced: !!namespace,
      namespace,
      isList: true,
    },
    vmTemplates: {
      groupVersionKind: modelToGroupVersionKind(TemplateModel),
      namespaced: !!namespace,
      namespace,
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
      namespaced: !!namespace,
      namespace,
      isList: true,
    },
  };

  const resources = useK8sWatchResources<{ [key: string]: K8sResourceCommon[] }>(watchedResources);

  return useMemo(() => {
    return Object.entries(resources).reduce(
      (acc, [key, value]) => {
        acc[key] = value?.data?.length;
        acc.loaded = acc.loaded && value?.loaded;
        return acc;
      },
      { loaded: false as boolean, nads: 0, nodes: 0, vms: 0, vmTemplates: 0 },
    );
  }, [resources]);
};

export default useResourcesQuantities;
