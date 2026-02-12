import { useMemo } from 'react';
import useVMNetworks from 'src/views/vmnetworks/hooks/useVMNetworks';
import { getVMNetworkProjects } from 'src/views/vmnetworks/utils';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import useProjectResources from '@kubevirt-utils/hooks/useProjectResources';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

import { VMNetworkWithProjects } from '../types';

type UseSelectableVMNetworksWithProjects = (
  currentNetworkName: string,
  vms: V1VirtualMachine[],
) => [vmNetworksWithProjects: VMNetworkWithProjects[], loaded: boolean, error: Error];

/**
 * This hook returns VM networks (with their matching project names) that can be selected for the given set of VMs.
 * For each network it checks if the network namespaceSelector covers all the namespaces of the VMs. It also filters out the current network.
 *
 * @param currentNetworkName - The name of the current network.
 * @param vms - The VMs to check.
 * @returns The selectable VM networks with their matching project names, loaded status, and error.
 */
const useSelectableVMNetworksWithProjects: UseSelectableVMNetworksWithProjects = (
  currentNetworkName,
  vms,
) => {
  const [vmNetworks, vmNetworksLoaded, vmNetworksError] = useVMNetworks();
  const [projects, projectsLoaded, projectsError] = useProjectResources();

  const vmNamespaces = useMemo(() => vms?.map((vm) => getNamespace(vm)) ?? [], [vms]);

  const vmNetworksWithProjects = useMemo(
    () =>
      vmNetworks
        ?.map((vmNetwork) => {
          const projectNames = getVMNetworkProjects(vmNetwork, projects).map((project) =>
            getName(project),
          );

          return { projectNames, vmNetworkName: getName(vmNetwork) };
        })
        .filter(({ projectNames, vmNetworkName }) => {
          if (vmNetworkName === currentNetworkName) return false;

          return (
            projectNames.includes(DEFAULT_NAMESPACE) ||
            vmNamespaces.every((ns) => projectNames.includes(ns))
          );
        }),
    [vmNetworks, projects, vmNamespaces, currentNetworkName],
  );

  return [
    vmNetworksWithProjects,
    vmNetworksLoaded && projectsLoaded,
    vmNetworksError || projectsError,
  ];
};

export default useSelectableVMNetworksWithProjects;
