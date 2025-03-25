import { useMemo } from 'react';

import {
  VirtualMachineInstanceModelGroupVersionKind,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getAnnotation, getLabels, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVMIIPAddresses } from '@kubevirt-utils/resources/vmi/utils/ips';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { SearchSuggestResult } from '@search/utils/types';
import { compareCIDR, OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

type UseVirtualMachineSearchSuggestions = (
  searchQuery: string,
) => [result: SearchSuggestResult, loaded: boolean];

export const useVirtualMachineSearchSuggestions: UseVirtualMachineSearchSuggestions = (
  searchQuery,
) => {
  const [vms, vmsLoaded] = useK8sWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
    namespaced: true,
  });

  const [vmis, vmisLoaded] = useK8sWatchResource<V1VirtualMachineInstance[]>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
    namespaced: true,
  });

  const vmsToSuggest = useMemo<V1VirtualMachine[]>(
    () =>
      vmsLoaded
        ? vms.filter((vm) => getName(vm).toLowerCase().includes(searchQuery.toLowerCase()))
        : [],
    [vms, vmsLoaded, searchQuery],
  );

  const vmsMatchingDescription = useMemo<V1VirtualMachine[]>(
    () =>
      vmsLoaded
        ? vms.filter((vm) =>
            getAnnotation(vm, 'description', '').toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : [],
    [vms, vmsLoaded, searchQuery],
  );

  const vmsMatchingIP = useMemo<V1VirtualMachine[]>(
    () =>
      vmsLoaded && vmisLoaded
        ? vms.filter((vm) => {
            const vmInstance = vmis.find(
              (vmi) => getName(vm) === getName(vmi) && getNamespace(vm) === getNamespace(vmi),
            );

            const ipAddresses = getVMIIPAddresses(vmInstance);

            return searchQuery.includes('/')
              ? ipAddresses.some((ipAddress) => compareCIDR(searchQuery, ipAddress))
              : ipAddresses.some((ipAddress) => ipAddress?.includes(searchQuery));
          })
        : [],
    [vms, vmsLoaded, vmis, vmisLoaded, searchQuery],
  );

  const vmsMatchingLabels = useMemo<V1VirtualMachine[]>(
    () =>
      vmsLoaded
        ? vms.filter((vm) =>
            Object.entries(getLabels(vm, {}))
              .map(([key, value]) => `${key}=${value}`)
              .some((label) => label.toLowerCase().includes(searchQuery.toLowerCase())),
          )
        : [],
    [vms, vmsLoaded, searchQuery],
  );

  const result = useMemo<SearchSuggestResult>(
    () => ({
      resources: vmsToSuggest.map((vm) => ({
        name: vm.metadata.name,
        namespace: vm.metadata.namespace,
      })),
      resourcesMatching: {
        description: vmsMatchingDescription.length,
        ip: vmsMatchingIP.length,
        labels: vmsMatchingLabels.length,
      },
    }),
    [vmsToSuggest, vmsMatchingDescription, vmsMatchingIP, vmsMatchingLabels],
  );

  return [result, vmsLoaded && vmisLoaded];
};
