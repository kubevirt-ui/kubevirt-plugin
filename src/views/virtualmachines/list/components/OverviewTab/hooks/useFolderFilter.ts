import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import { getLabel, getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

type UseFolderFilterResult = {
  filteredVMs: V1VirtualMachine[];
  vmNames: string[] | undefined;
};

const useFolderFilter = (vms: undefined | V1VirtualMachine[]): UseFolderFilterResult => {
  const queryParams = useQuery();

  const folderNames = useMemo(
    () => queryParams.getAll(VirtualMachineRowFilterType.Group).filter(Boolean),
    [queryParams],
  );

  const filteredVMs = useMemo(() => {
    if (isEmpty(folderNames) || !vms) return vms || [];
    return vms.filter((vm) => folderNames.includes(getLabel(vm, VM_FOLDER_LABEL)));
  }, [vms, folderNames]);

  const vmNames = useMemo(() => {
    if (isEmpty(folderNames)) return undefined;
    return filteredVMs.map((vm) => getName(vm)).filter(Boolean);
  }, [folderNames, filteredVMs]);

  return { filteredVMs, vmNames };
};

export default useFolderFilter;
