import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useQueryParamsMethods } from '@kubevirt-utils/components/ListPageFilter/hooks/useQueryParamsMethods';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import useVMsInNamespace from '@kubevirt-utils/hooks/useVMsInNamespace';
import { getLabel, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

type RemoveFolderQuery = ((newFolderName: string) => void) | null;

const useRemoveFolderQuery = (vmsToMove: V1VirtualMachine[]): RemoveFolderQuery => {
  const namespace = getNamespace(vmsToMove[0]);
  const allVMsInNamespace = useVMsInNamespace(namespace);

  const { removeQueryArgumentValues } = useQueryParamsMethods();
  const queryParams = useQuery();

  const currentGroups = useMemo(
    () => queryParams.getAll(VirtualMachineRowFilterType.Group).filter(Boolean),
    [queryParams],
  );

  if (isEmpty(currentGroups)) {
    return null;
  }

  const removeFolderQuery = (newFolderName: string) => {
    const groupsToRemove = currentGroups.filter((group) => {
      // VMs are moving into this group — it won't become empty
      if (group === newFolderName) return false;

      const isVMInGroup = (vm: V1VirtualMachine) => getLabel(vm, VM_FOLDER_LABEL) === group;

      const vmsInGroup = allVMsInNamespace.filter(isVMInGroup);
      const movedFromGroup = vmsToMove.filter(isVMInGroup);

      return !isEmpty(movedFromGroup) && movedFromGroup.length === vmsInGroup.length;
    });

    if (!isEmpty(groupsToRemove)) {
      removeQueryArgumentValues(VirtualMachineRowFilterType.Group, groupsToRemove);
    }
  };

  return removeFolderQuery;
};

export default useRemoveFolderQuery;
