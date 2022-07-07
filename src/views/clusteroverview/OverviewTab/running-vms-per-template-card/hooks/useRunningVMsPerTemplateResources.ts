import * as React from 'react';

import {
  modelToGroupVersionKind,
  TemplateModel,
  V1Template,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import {
  getAllowedResourceData,
  getAllowedResources,
  getAllowedTemplateResources,
} from '@kubevirt-utils/resources/shared';
import { TEMPLATE_TYPE_LABEL } from '@kubevirt-utils/resources/template';
import { K8sResourceCommon, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { useDeepCompareMemoize } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useDeepCompareMemoize';

import { useProjectNames } from '../../inventory-card/hooks/useProjectNames';

import { useDebounceCallback } from './../../../utils/hooks/useDebounceCallback';

export type UseRunningVMsPerTemplateResources = {
  loaded: boolean;
  loadError: string;
  vms: V1VirtualMachine[];
  templates: V1Template[];
};

export const useAdminRunningVMsPerTemplateResources = (): UseRunningVMsPerTemplateResources => {
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
      setTemplates([...updatedResources?.vmTemplates?.data]);
    }
  }, []);

  const debouncedUpdateResources = useDebounceCallback(updateResults, 250);

  React.useEffect(() => {
    debouncedUpdateResources(resources);
  }, [debouncedUpdateResources, resources]);

  return useDeepCompareMemoize({ loaded, loadError, vms, templates });
};

export const useNonAdminRunningVMsPerTemplateResources = () => {
  const projectNames = useProjectNames();
  const allowedVMResources = getAllowedResources(projectNames, VirtualMachineModel);
  const allowedVMTemplateResources = getAllowedTemplateResources(projectNames);

  const watchedResources = {
    ...allowedVMTemplateResources,
    ...allowedVMResources,
  };

  const resources = useK8sWatchResources<{ [key: string]: K8sResourceCommon[] }>(watchedResources);

  const resourcesLoadError = Object.keys(resources).find((key) => resources[key].loadError);
  const resourcesLoaded = Object.keys(resources).some((key) => resources[key].loaded);

  const { data: vms } = getAllowedResourceData(resources, VirtualMachineModel);

  const { data: templates } = getAllowedResourceData(resources, TemplateModel);

  return {
    vms,
    templates,
    loaded: resourcesLoaded,
    loadError: resourcesLoadError,
  };
};

// as cluster admin we should see all resources
// otherwise we should only see resources that are in the project list
export const useRunningVMsPerTemplatesHook = () => {
  const isAdmin = useIsAdmin();
  return isAdmin
    ? useAdminRunningVMsPerTemplateResources
    : useNonAdminRunningVMsPerTemplateResources;
};
