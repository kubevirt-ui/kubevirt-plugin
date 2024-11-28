import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VirtualMachineModelGroupVersionKind } from '@kubevirt-utils/models';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { SelectOptionProps } from '@patternfly/react-core';
import { FolderIcon } from '@patternfly/react-icons';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

type UseFolderOptions = (
  namespace: string,
) => [SelectOptionProps[], Dispatch<SetStateAction<SelectOptionProps[]>>];

const useFolderOptions: UseFolderOptions = (namespace) => {
  const [folders, setFolders] = useState<SelectOptionProps[]>();
  const [vms] = useK8sWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    namespace,
  });

  useEffect(() => {
    if (isEmpty(vms)) return null;

    const folderOptions = vms.reduce((uniqueValues, vm) => {
      const folderLabel = getLabel(vm, VM_FOLDER_LABEL);
      if (folderLabel && !uniqueValues.some((obj) => obj.value === folderLabel)) {
        uniqueValues.push({ children: folderLabel, icon: <FolderIcon />, value: folderLabel });
      }
      return uniqueValues;
    }, []);

    setFolders(folderOptions);
  }, [vms]);

  return [folders, setFolders];
};

export default useFolderOptions;
