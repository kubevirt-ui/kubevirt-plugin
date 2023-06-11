import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  TemplateModel,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { TEMPLATE_TYPE_LABEL } from '@kubevirt-utils/resources/template';
import { K8sResourceCommon, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';

type UseVMsPerTemplateResources = () => {
  loaded: boolean;
  templates: K8sResourceCommon[];
  vms: K8sResourceCommon[];
};

const useVMsPerTemplateResources: UseVMsPerTemplateResources = () => {
  const [activeNamespace] = useActiveNamespace();
  const namespace = useMemo(
    () => (activeNamespace === ALL_NAMESPACES_SESSION_KEY ? null : activeNamespace),
    [activeNamespace],
  );

  const watchedResources = {
    templates: {
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
    vms: {
      groupVersionKind: VirtualMachineModelGroupVersionKind,
      isList: true,
      namespace,
      namespaced: !!namespace,
    },
  };

  const resourceData = useK8sWatchResources<{ [key: string]: K8sResourceCommon[] }>(
    watchedResources,
  );

  return useMemo(() => {
    return {
      loaded: resourceData?.templates?.loaded && resourceData?.vms?.loaded,
      templates: resourceData?.templates?.data,
      vms: resourceData?.vms?.data,
    };
  }, [resourceData]);
};

export default useVMsPerTemplateResources;
