import { MouseEvent, useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom-v5-compat';

import { useQueryParamsMethods } from '@kubevirt-utils/components/ListPageFilter/hooks/useQueryParamsMethods';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { useLastNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
import { TEXT_FILTER_LABELS_ID } from '@virtualmachines/list/hooks/constants';

import {
  FOLDER_SELECTOR_PREFIX,
  PROJECT_SELECTOR_PREFIX,
  VM_FOLDER_LABEL,
} from '../utils/constants';
import { treeDataMap, TreeViewDataItemWithHref } from '../utils/utils';

const useTreeViewSelect = (
  onFilterChange: OnFilterChange,
): [
  selected: TreeViewDataItemWithHref,
  onSelect: (_event: MouseEvent, treeViewItem: TreeViewDataItemWithHref) => void,
  alertMessage: string,
] => {
  const { t } = useKubevirtTranslation();
  const location = useLocation();
  const { ns } = useParams<{ ns: string }>();
  const [searchParams] = useSearchParams();
  const dataMap = treeDataMap.value;

  const [selected, setSelected] = useState<TreeViewDataItemWithHref>(null);
  const [alertMessage, setAlertMessage] = useState<string>(null);

  const navigate = useNavigate();
  const { setOrRemoveQueryArgument } = useQueryParamsMethods();
  const [_, setLastNamespace] = useLastNamespace();
  const isAdmin = useIsAdmin();
  const [projectNames, projectNamesLoaded] = useProjects();

  const onSelect = useCallback(
    (_event: MouseEvent, treeViewItem: TreeViewDataItemWithHref) => {
      setSelected(treeViewItem);
      navigate(treeViewItem.href);

      if (treeViewItem.id.startsWith(FOLDER_SELECTOR_PREFIX)) {
        const treeItemName = treeViewItem.name as string;
        setOrRemoveQueryArgument(TEXT_FILTER_LABELS_ID, `${VM_FOLDER_LABEL}=${treeItemName}`);
        return onFilterChange?.(TEXT_FILTER_LABELS_ID, {
          all: [`${VM_FOLDER_LABEL}=${treeItemName}`],
        });
      }
    },
    [navigate, onFilterChange, setOrRemoveQueryArgument],
  );

  useEffect(() => {
    const selectAllNamespaces = () => {
      setSelected(dataMap?.[ALL_NAMESPACES_SESSION_KEY]);
      setLastNamespace(ALL_NAMESPACES);
    };

    const selectFirstAccessibleProject = (): boolean => {
      if (!isEmpty(projectNames)) {
        const firstProject = projectNames[0];
        const firstProjectTreeItem = dataMap?.[`${PROJECT_SELECTOR_PREFIX}/${firstProject}`];

        if (firstProjectTreeItem) {
          setSelected(firstProjectTreeItem);
          setLastNamespace(firstProject);
          navigate(`/k8s/ns/${firstProject}/virtualization`);
          return true;
        }
      }
      return false;
    };

    const selectDefaultProjectFallback = (): boolean => {
      if (!projectNames.includes(DEFAULT_NAMESPACE)) {
        const defaultProjectTreeItem = dataMap?.[`${PROJECT_SELECTOR_PREFIX}/${DEFAULT_NAMESPACE}`];
        if (defaultProjectTreeItem) {
          setSelected(defaultProjectTreeItem);
          setLastNamespace(DEFAULT_NAMESPACE);
          navigate(`/k8s/ns/${DEFAULT_NAMESPACE}/virtualization`);
          return true;
        }
      }
      return false;
    };

    const selectFolderOrVMOrProject = () => {
      setLastNamespace(ns);

      const labelsParam = searchParams?.get('labels');
      if (labelsParam?.startsWith(VM_FOLDER_LABEL)) {
        const [__, folder] = labelsParam.split('=');
        setSelected(dataMap?.[`${FOLDER_SELECTOR_PREFIX}/${ns}/${folder}`]);
        return;
      }

      const currentPageVMName = location.pathname.split('/')[5];
      if (currentPageVMName) {
        setSelected(dataMap?.[`${ns}/${currentPageVMName}`]);
        return;
      }

      setSelected(dataMap?.[`${PROJECT_SELECTOR_PREFIX}/${ns}`]);
    };

    if (isEmpty(selected) || location.pathname !== selected.href) {
      if (!ns) {
        if (isAdmin) {
          selectAllNamespaces();
        } else if (projectNamesLoaded) {
          if (selectFirstAccessibleProject()) return;
          if (selectDefaultProjectFallback()) return;

          setAlertMessage(t('User has no accessible namespaces for VirtualMachines'));
        }
        return;
      }

      selectFolderOrVMOrProject();
    }
  }, [
    dataMap,
    location.pathname,
    ns,
    searchParams,
    selected,
    setLastNamespace,
    isAdmin,
    projectNames,
    projectNamesLoaded,
    navigate,
    t,
  ]);

  return [selected, onSelect, alertMessage];
};

export default useTreeViewSelect;
