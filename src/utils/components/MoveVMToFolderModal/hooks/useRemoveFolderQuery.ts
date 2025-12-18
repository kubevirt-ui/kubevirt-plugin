import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useQueryParamsMethods } from '@kubevirt-utils/components/ListPageFilter/hooks/useQueryParamsMethods';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import useVMsInNamespace from '@kubevirt-utils/hooks/useVMsInNamespace';
import { getLabel, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { TEXT_FILTER_LABELS_ID } from '@virtualmachines/list/hooks/constants';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

export type RemoveFolderQuery = ((newFolderName: string) => void) | null;

// if no vmsToMove are passed, checking that all VMs in current folder are moved is skipped and has to be done elsewhere
const useRemoveFolderQuery = (vmsToMove?: V1VirtualMachine[]): RemoveFolderQuery => {
  const skipCheckMovingAllVMs = isEmpty(vmsToMove);

  // can't conditionally call useVMsInNamespace hook, so use invalid namespace '-'
  const namespace = skipCheckMovingAllVMs ? '-' : getNamespace(vmsToMove[0]);
  const allVMsInNamespace = useVMsInNamespace(namespace);

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
    skipCheckMovingAllVMs ||
    vmsToMove.filter(isVMInCurrentFolder).length ===
      allVMsInNamespace.filter(isVMInCurrentFolder).length;

  const removeFolderQuery = (newFolderName: string) => {
    if (isMovingAllVMs && newFolderName !== currentFolderName) {
      const newLabelQuery = labelFilters.filter((label) => label !== currentFolderLabel).join(',');
      setOrRemoveQueryArgument(TEXT_FILTER_LABELS_ID, newLabelQuery);
    }
  };

  return removeFolderQuery;
};

export default useRemoveFolderQuery;
