import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { PodModel, ReplicationControllerModel } from '@kubevirt-ui/kubevirt-api/console';
import { VirtualMachineInstanceModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Pod } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVMIPod } from '@kubevirt-utils/resources/vmi';
import {
  ExtPodKind,
  getGroupVersionKindForModel,
  K8sResourceCommon,
  K8sResourceKind,
  PodRCData,
  useK8sWatchResources,
} from '@openshift-console/dynamic-plugin-sdk';
import { useDebounceCallback } from '@overview/utils/hooks/useDebounceCallback';

import { getReplicationControllersForResource } from '../utils/resource-utils';

type UsePodsForVM = (vm: V1VirtualMachine) => {
  loaded: boolean;
  loadError: string;
  podData: PodRCData;
};

const usePodsForVM: UsePodsForVM = (vm) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string>('');
  const [podData, setPodData] = useState<PodRCData>();
  const vmRef = useRef<K8sResourceKind>(vm);

  const vmName = getName(vm);
  const vmNamespace = getNamespace(vm);

  const watchedResources = useMemo(
    () => ({
      pods: {
        groupVersionKind: getGroupVersionKindForModel(PodModel),
        isList: true,
        vmNamespace,
      },
      replicationControllers: {
        groupVersionKind: getGroupVersionKindForModel(ReplicationControllerModel),
        isList: true,
        vmNamespace,
      },
      virtualmachineinstances: {
        groupVersionKind: getGroupVersionKindForModel(VirtualMachineInstanceModel),
        isList: true,
        optional: true,
        vmNamespace,
      },
    }),
    [vmNamespace],
  );

  const resources = useK8sWatchResources<{ [key: string]: K8sResourceCommon[] }>(watchedResources);

  const updateResults = useCallback(
    (updatedResources) => {
      const errorKey = Object.keys(updatedResources).find((key) => updatedResources[key].loadError);
      if (errorKey) {
        setLoadError(updatedResources[errorKey].loadError);
        return;
      }
      if (
        Object.keys(updatedResources).length > 0 &&
        Object.keys(updatedResources).every((key) => updatedResources[key].loaded)
      ) {
        const vmis = updatedResources.virtualmachineinstances.data;
        const vmi = vmis.find(
          (instance) => instance.metadata.name === vmName,
        ) as V1VirtualMachineInstance;
        const { visibleReplicationControllers } = getReplicationControllersForResource(
          vmRef.current,
          updatedResources,
        );
        const [current, previous] = visibleReplicationControllers;
        const launcherPod = getVMIPod(
          vmi,
          updatedResources.pods.data as IoK8sApiCoreV1Pod[],
        ) as ExtPodKind;
        const podRCData: PodRCData = {
          current,
          isRollingOut: false,
          obj: vm,
          pods: launcherPod ? [launcherPod] : [],
          previous,
        };
        setLoaded(true);
        setLoadError(null);
        setPodData(podRCData);
      }
    },
    // Don't update on a resource change, we want the debounce callback to be consistent
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vmName],
  );

  const debouncedUpdateResources = useDebounceCallback(updateResults, 250);

  useEffect(() => {
    debouncedUpdateResources(resources);
  }, [debouncedUpdateResources, resources]);

  return useDeepCompareMemoize({ loaded, loadError, podData });
};

export default usePodsForVM;
