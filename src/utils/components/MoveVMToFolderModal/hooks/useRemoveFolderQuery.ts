import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useQueryParamsMethods } from '@kubevirt-utils/components/ListPageFilter/hooks/useQueryParamsMethods';
import { getLabel } from '@kubevirt-utils/resources/shared';
import useQuery from '@virtualmachines/details/tabs/metrics/NetworkCharts/hook/useQuery';
import { TEXT_FILTER_LABELS_ID } from '@virtualmachines/list/hooks/constants';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

export type RemoveFolderQuery = ((newFolderName: string) => void) | null;

const useRemoveFolderQuery = (
  vmsToMove: V1VirtualMachine[],
  allVMs: V1VirtualMachine[],
): RemoveFolderQuery => {
  const { setOrRemoveQueryArgument } = useQueryParamsMethods();

  const queryParams = useQuery();
  const labelFilters = useMemo(() => queryParams.get('labels')?.split(',') ?? [], [queryParams]);

  const currentFolderLabel = labelFilters.find((label) => label.startsWith(VM_FOLDER_LABEL));
  if (!currentFolderLabel) {
    return null;
  }

  const currentFolderName = currentFolderLabel.split('=')[1];

  const isVMInCurrentFolder = (vm: V1VirtualMachine) =>
    getLabel(vm, VM_FOLDER_LABEL) === currentFolderName;

  const isMovingAllVMs =
    vmsToMove.filter(isVMInCurrentFolder).length === allVMs.filter(isVMInCurrentFolder).length;

  const removeFolderQuery = (newFolderName: string) => {
    if (isMovingAllVMs && newFolderName !== currentFolderName) {
      const newLabelQuery = labelFilters.filter((label) => label !== currentFolderLabel).join(',');
      setOrRemoveQueryArgument(TEXT_FILTER_LABELS_ID, newLabelQuery);
    }
  };

  return removeFolderQuery;
};

export default useRemoveFolderQuery;
