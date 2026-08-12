import { useMemo } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useQueryParamsMethods } from '@kubevirt-utils/hooks/useQueryParamsMethods';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import useVMsInNamespace from '@kubevirt-utils/hooks/useVMsInNamespace';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { isVMInGroup } from '../utils';

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

  const removeFolderQuery = (newFolderName: string): void => {
    const groupsToRemove = currentGroups.filter((group) => {
      // VMs are moving into this group — it won't become empty
      if (group === newFolderName) return false;

      const vmsInGroup = allVMsInNamespace.filter(isVMInGroup(group));
      const movedFromGroup = vmsToMove.filter(isVMInGroup(group));

      return !isEmpty(movedFromGroup) && movedFromGroup.length === vmsInGroup.length;
    });

    if (!isEmpty(groupsToRemove)) {
      removeQueryArgumentValues(VirtualMachineRowFilterType.Group, groupsToRemove);
    }
  };

  return removeFolderQuery;
};

export default useRemoveFolderQuery;
