import * as React from 'react';

import {
  modelToGroupVersionKind,
  TemplateModel,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { TEMPLATE_TYPE_BASE, TEMPLATE_TYPE_LABEL } from '@kubevirt-utils/resources/template';
import { K8sResourceCommon, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { useDeepCompareMemoize } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useDeepCompareMemoize';

import { useDebounceCallback } from '../../../details-card/hooks/useDebounceCallback';

export type UseRunningVMsPerTemplateResources = {
  loaded: boolean;
  loadError: string;
  vms: any[]; // TODO Fix type back to VMKind[]
  templates: any[]; // TODO Fix type back to TemplateKind[]
};

export const useRunningVMsPerTemplateResources = (): UseRunningVMsPerTemplateResources => {
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [loadError, setLoadError] = React.useState<string>('');
  const [vms, setVMs] = React.useState([]);
  const [templates, setTemplates] = React.useState([]);

  const watchedResources = {
    vms: {
      groupVersionKind: VirtualMachineModelGroupVersionKind,
      isList: true,
      namespaced: false,
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
    vmCommonTemplates: {
      groupVersionKind: modelToGroupVersionKind(TemplateModel),
      isList: true,
      namespace: 'openshift',
      selector: {
        matchLabels: { [TEMPLATE_TYPE_LABEL]: TEMPLATE_TYPE_BASE },
      },
    },
  };

  const resources = useK8sWatchResources<{ [key: string]: K8sResourceCommon[] }>(watchedResources);

  const updateResults = React.useCallback((updatedResources) => {
    const errorKey = Object.keys(updatedResources).find((key) => updatedResources[key].loadError);
    if (errorKey) {
      setLoadError(updatedResources[errorKey].loadError);
      return;
    }
    if (
      Object.keys(updatedResources).length > 0 &&
      Object.keys(updatedResources).every((key) => updatedResources[key].loaded)
    ) {
      setLoaded(true);
      setLoadError(null);
      setVMs(updatedResources?.vms?.data);
      setTemplates([
        ...updatedResources?.vmTemplates?.data,
        ...updatedResources?.vmCommonTemplates?.data,
      ]);
    }
  }, []);

  const debouncedUpdateResources = useDebounceCallback(updateResults, 250);

  React.useEffect(() => {
    debouncedUpdateResources(resources);
  }, [debouncedUpdateResources, resources]);

  return useDeepCompareMemoize({ loaded, loadError, vms, templates });
};
