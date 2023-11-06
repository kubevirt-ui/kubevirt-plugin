import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  TemplateModel,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { TEMPLATE_TYPE_LABEL } from '@kubevirt-utils/resources/template';
import { K8sResourceCommon, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';

type UseVMsPerTemplateResources = () => {
  loaded: boolean;
  vms: K8sResourceCommon[];
  templates: K8sResourceCommon[];
};

const useVMsPerTemplateResources: UseVMsPerTemplateResources = () => {
  const [activeNamespace] = useActiveNamespace();
  const namespace = useMemo(
    () => (activeNamespace === ALL_NAMESPACES_SESSION_KEY ? null : activeNamespace),
    [activeNamespace],
  );

  const watchedResources = {
    vms: {
      groupVersionKind: VirtualMachineModelGroupVersionKind,
      isList: true,
      namespaced: !!namespace,
      namespace,
    },
    templates: {
      groupVersionKind: modelToGroupVersionKind(TemplateModel),
      isList: true,
      namespaced: !!namespace,
      namespace,
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

  const resourceData = useK8sWatchResources<{ [key: string]: K8sResourceCommon[] }>(
    watchedResources,
  );

  return useMemo(() => {
    return {
      templates: resourceData?.templates?.data,
      vms: resourceData?.vms?.data,
      loaded: resourceData?.templates?.loaded && resourceData?.vms?.loaded,
    };
  }, [resourceData]);
};

export default useVMsPerTemplateResources;
