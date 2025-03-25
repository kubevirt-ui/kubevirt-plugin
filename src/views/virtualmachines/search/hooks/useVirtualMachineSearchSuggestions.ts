import { useMemo } from 'react';
import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { SearchSuggestResult } from '@search/components/SearchBar';

export const useVirtualMachineSearchSuggestions = (
  searchQuery: string,
): [result: SearchSuggestResult, loaded: boolean] => {
  const [vms, loaded] = useK8sWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    limit: 100,
  });

  const vmsToSuggest = useMemo(
    () => vms.filter((vm) => vm?.metadata.name?.includes(searchQuery)),
    [vms, searchQuery],
  );

  const result = useMemo<SearchSuggestResult>(
    () => ({
      resources: vmsToSuggest.map((vm) => ({
        name: vm?.metadata?.name,
        namespace: vm?.metadata?.namespace,
      })),
      // TODO: count "vms" matching their description
      resourcesMatching: { description: 0 },
    }),
    [vmsToSuggest],
  );

  return [result, loaded];
};
