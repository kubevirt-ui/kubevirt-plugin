import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { STATIC_SEARCH_FILTERS } from '@kubevirt-utils/components/ListPageFilter/constants';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import { getLabel, getName, isFolderLabel } from '@kubevirt-utils/resources/shared';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

type UseFolderFilterResult = {
  filteredVMs: V1VirtualMachine[];
  vmNames: string[] | undefined;
};

const useFolderFilter = (vms: undefined | V1VirtualMachine[]): UseFolderFilterResult => {
  const queryParams = useQuery();

  const folderName = useMemo(() => {
    const labelFilters = queryParams.getAll(STATIC_SEARCH_FILTERS.labels);
    const folderLabel = labelFilters.find(isFolderLabel);
    if (!folderLabel) return undefined;
    const eqIdx = folderLabel.indexOf('=');
    return eqIdx >= 0 ? folderLabel.slice(eqIdx + 1) : undefined;
  }, [queryParams]);

  const filteredVMs = useMemo(() => {
    if (!folderName || !vms) return vms || [];
    return vms.filter((vm) => getLabel(vm, VM_FOLDER_LABEL) === folderName);
  }, [vms, folderName]);

  const vmNames = useMemo(() => {
    if (!folderName) return undefined;
    return filteredVMs.map((vm) => getName(vm)).filter(Boolean);
  }, [folderName, filteredVMs]);

  return { filteredVMs, vmNames };
};

export default useFolderFilter;
