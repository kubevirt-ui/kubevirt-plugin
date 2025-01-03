import { MouseEvent, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom-v5-compat';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { useQueryParamsMethods } from '@kubevirt-utils/components/ListPageFilter/hooks/useQueryParamsMethods';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { FilterValue } from '@openshift-console/dynamic-plugin-sdk';
import { TreeViewDataItem } from '@patternfly/react-core';
import { TEXT_FILTER_LABELS_ID } from '@virtualmachines/list/hooks/constants';

import {
  FOLDER_SELECTOR_PREFIX,
  PROJECT_SELECTOR_PREFIX,
  VM_FOLDER_LABEL,
} from '../utils/constants';
import { treeDataMap } from '../utils/utils';

const useTreeViewSelect = (
  onFilterChange: (type: string, value: FilterValue) => void,
): [
  selected: TreeViewDataItem,
  onSelect: (_event: MouseEvent, treeViewItem: TreeViewDataItem) => void,
] => {
  const location = useLocation();
  const { ns } = useParams<{ ns: string }>();
  const [searchParams] = useSearchParams();
  const dataMap = treeDataMap.value;

  const selected = useMemo(() => {
    if (!ns) {
      return dataMap?.[ALL_NAMESPACES_SESSION_KEY];
    }

    const labelsParam = searchParams?.get('labels');
    if (labelsParam?.startsWith(VM_FOLDER_LABEL)) {
      const [__, folder] = labelsParam.split('=');
      return dataMap?.[`${FOLDER_SELECTOR_PREFIX}/${ns}/${folder}`];
    }

    const currentPageVMName = location.pathname.split('/')[5];

    if (currentPageVMName) {
      return dataMap?.[`${ns}/${currentPageVMName}`];
    }
    return dataMap?.[`${PROJECT_SELECTOR_PREFIX}/${ns}`];
  }, [location.pathname, ns, searchParams, dataMap]);

  const navigate = useNavigate();
  const { setOrRemoveQueryArgument } = useQueryParamsMethods();

  const onSelect = useCallback(
    (_event: MouseEvent, treeViewItem: TreeViewDataItem) => {
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

      if (treeViewItem.id === ALL_NAMESPACES_SESSION_KEY) {
        return navigate(
          getResourceUrl({
            model: VirtualMachineModel,
          }),
        );
      }

      const [vmNamespace, vmName] = treeViewItem.id.split('/');
      return navigate(
        getResourceUrl({
          activeNamespace: vmNamespace,
          model: VirtualMachineModel,
          resource: { metadata: { name: vmName, namespace: vmNamespace } },
        }),
      );
    },
    [navigate, onFilterChange, setOrRemoveQueryArgument],
  );

  return [selected, onSelect];
};

export default useTreeViewSelect;
