import { MouseEvent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useQueryParamsMethods } from '@kubevirt-utils/components/ListPageFilter/hooks/useQueryParamsMethods';
import { convertResourceArrayToMap, getResourceUrl } from '@kubevirt-utils/resources/shared';
import { FilterValue } from '@openshift-console/dynamic-plugin-sdk';
import { TreeViewDataItem } from '@patternfly/react-core';
import { TEXT_FILTER_LABELS_ID } from '@virtualmachines/list/hooks/constants';

import {
  FOLDER_SELECTOR_PREFIX,
  PROJECT_SELECTOR_PREFIX,
  VM_FOLDER_LABEL,
} from '../utils/constants';

const useTreeViewSelect = (
  onFilterChange: (type: string, value: FilterValue) => void,
  vms: V1VirtualMachine[],
) => {
  const navigate = useNavigate();
  const { setOrRemoveQueryArgument } = useQueryParamsMethods();

  const vmsMapper = useMemo(() => convertResourceArrayToMap(vms, true), [vms]);

  const onSelect = (_event: MouseEvent, treeViewItem: TreeViewDataItem) => {
    onFilterChange?.(TEXT_FILTER_LABELS_ID, null);

    const treeItemName = treeViewItem.name as string;
    if (treeViewItem.id.startsWith(FOLDER_SELECTOR_PREFIX)) {
      const [__, folderNamespace] = treeViewItem.id.split('/');
      navigate(
        getResourceUrl({
          activeNamespace: folderNamespace,
          model: VirtualMachineModel,
        }),
      );
      setOrRemoveQueryArgument(TEXT_FILTER_LABELS_ID, `${VM_FOLDER_LABEL}=${treeItemName}`);
      return onFilterChange?.(TEXT_FILTER_LABELS_ID, {
        all: [`${VM_FOLDER_LABEL}=${treeItemName}`],
      });
    }

    if (treeViewItem.id.startsWith(PROJECT_SELECTOR_PREFIX)) {
      return navigate(
        getResourceUrl({
          activeNamespace: treeItemName,
          model: VirtualMachineModel,
        }),
      );
    }

    const [vmNamespace, vmName] = treeViewItem.id.split('/');
    return navigate(
      getResourceUrl({
        activeNamespace: vmNamespace,
        model: VirtualMachineModel,
        resource: vmsMapper?.[vmNamespace]?.[vmName],
      }),
    );
  };

  return onSelect;
};

export default useTreeViewSelect;
