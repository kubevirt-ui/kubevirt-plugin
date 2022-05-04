import * as React from 'react';

import {
  modelToGroupVersionKind,
  ProjectModel,
  TemplateModel,
  V1Template,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { TEMPLATE_TYPE_BASE, TEMPLATE_TYPE_LABEL } from '@kubevirt-utils/resources/template';
import {
  K8sResourceCommon,
  useK8sWatchResource,
  useK8sWatchResources,
} from '@openshift-console/dynamic-plugin-sdk';
import { useDeepCompareMemoize } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useDeepCompareMemoize';

import {
  getAllowedResourceData,
  getAllowedResources,
  getAllowedTemplateResources,
} from '../../../utils/utils';
import { useDebounceCallback } from '../../details-card/hooks/useDebounceCallback';
import {
  KUBEVIRT_OS_IMAGES_NS,
  OPENSHIFT_OS_IMAGES_NS,
} from '../../inventory-card/utils/constants';

export type UseRunningVMsPerTemplateResources = {
  loaded: boolean;
  loadError: string;
  vms: V1VirtualMachine[];
  templates: V1Template[];
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

export const useProjectNames = (): string[] => {
  const [projects] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    namespaced: false,
    isList: true,
  });
  // a user can see VMs if they are project-admin we should remove either
  // 'kubevirt-os-images' or 'openshift-virtualization-os-images';
  const projectNames = (projects || [])
    .map((project) => project.metadata.name)
    .filter((project) => project !== KUBEVIRT_OS_IMAGES_NS && project !== OPENSHIFT_OS_IMAGES_NS);

  return projectNames;
};

export const useRunningVMsPerTemplateResourcesHook = () => {
  const projectNames = useProjectNames();
  const allowedVMResources = getAllowedResources(projectNames, VirtualMachineModel);
  const allowedVMTemplateResources = getAllowedTemplateResources(projectNames);

  const watchedResources = {
    ...allowedVMTemplateResources,
    ...allowedVMResources,
  };

  const resources = useK8sWatchResources<{ [key: string]: K8sResourceCommon[] }>(watchedResources);

  const resourcesLoadError = Object.keys(resources).find((key) => resources[key].loadError);
  const resourcesLoaded = Object.keys(resources).every((key) => resources[key].loaded);

  const { data: vms } = getAllowedResourceData(resources, VirtualMachineModel);

  const { data: templates } = getAllowedResourceData(resources, TemplateModel);

  return {
    vms,
    templates,
    loaded: resourcesLoaded,
    loadError: resourcesLoadError,
  };
};
