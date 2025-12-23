import React, { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  NodeModel,
  TemplateModel,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { TEMPLATE_TYPE_LABEL } from '@kubevirt-utils/resources/template';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useKubevirtWatchResources from '@multicluster/hooks/useKubevirtWatchResources';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

type UseResourcesQuantities = () => {
  loaded: boolean;
  nads: number;
  nodes: number;
  vms: number;
  vmTemplates: number;
};

const useResourcesQuantities: UseResourcesQuantities = () => {
  const [activeNamespace] = useActiveNamespace();
  const cluster = useClusterParam();

  const namespace = React.useMemo(
    () => (activeNamespace === ALL_NAMESPACES_SESSION_KEY ? null : activeNamespace),
    [activeNamespace],
  );

  const watchedResources = {
    nads: {
      cluster,
      groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
      isList: true,
      namespace,
      namespaced: !!namespace,
    },
    nodes: {
      cluster,
      groupVersionKind: modelToGroupVersionKind(NodeModel),
      isList: true,
      namespaced: false,
    },
    vms: {
      cluster,
      groupVersionKind: VirtualMachineModelGroupVersionKind,
      isList: true,
      namespace,
      namespaced: !!namespace,
    },
    vmTemplates: {
      cluster,
      groupVersionKind: modelToGroupVersionKind(TemplateModel),
      isList: true,
      namespace,
      namespaced: !!namespace,
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

  const resources = useKubevirtWatchResources<{ [key: string]: K8sResourceCommon[] }>(
    watchedResources,
  );

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
