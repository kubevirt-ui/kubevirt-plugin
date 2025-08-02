import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom-v5-compat';
import { useNavigate, useSearchParams } from 'react-router-dom-v5-compat';

import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getVMListNamespacesURL } from '@multicluster/urls';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { useLastNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';

import {
  FOLDER_SELECTOR_PREFIX,
  PROJECT_SELECTOR_PREFIX,
  VM_FOLDER_LABEL,
} from '../utils/constants';
import { TreeViewDataItemWithHref } from '../utils/utils';
import { getVMInfoFromPathname } from '../utils/utils';

import useTreeViewSelect from './useTreeViewSelect';

type UseSelectNamespaceBasedOnPrivilegesProps = {
  dataMap: Record<string, TreeViewDataItemWithHref>;
  onFilterChange?: OnFilterChange;
};

const useSelectNamespaceBasedOnPrivileges = ({
  dataMap,
  onFilterChange,
}: UseSelectNamespaceBasedOnPrivilegesProps) => {
  const [selected, onSelect, setSelected] = useTreeViewSelect(onFilterChange);

  const { t } = useKubevirtTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [, setLastNamespace] = useLastNamespace();
  const isAdmin = useIsAdmin();
  const [projectNames, projectNamesLoaded] = useProjects();
  const [alertMessage, setAlertMessage] = useState<string>(null);

  const location = useLocation();
  const { ns } = useParams<{ ns: string }>();

  useEffect(() => {
    const selectAllNamespaces = () => {
      setSelected(dataMap?.[ALL_NAMESPACES_SESSION_KEY]);
      setLastNamespace(ALL_NAMESPACES);
    };

    const selectFirstAccessibleProject = (): boolean => {
      if (isEmpty(projectNames)) return false;

      const firstProject = projectNames[0];
      const treeItem = dataMap?.[`${PROJECT_SELECTOR_PREFIX}/${firstProject}`];
      if (treeItem) {
        setSelected(treeItem);
        setLastNamespace(firstProject);
        navigate(getVMListNamespacesURL(null, firstProject));
        return true;
      }
    };

    const selectDefaultProjectFallback = (): boolean => {
      if (projectNames.includes(DEFAULT_NAMESPACE)) return false;

      const treeItem = dataMap?.[`${PROJECT_SELECTOR_PREFIX}/${DEFAULT_NAMESPACE}`];
      if (treeItem) {
        setSelected(treeItem);
        setLastNamespace(DEFAULT_NAMESPACE);
        navigate(getVMListNamespacesURL(null, DEFAULT_NAMESPACE));
        return true;
      }
    };

    const selectFolderOrVMOrProject = () => {
      setLastNamespace(ns);

      const labelsParam = searchParams?.get('labels');
      if (labelsParam?.startsWith(VM_FOLDER_LABEL)) {
        const [, folder] = labelsParam.split('=');
        setSelected(dataMap?.[`${FOLDER_SELECTOR_PREFIX}/${ns}/${folder}`]);
        return;
      }

      const currentPageVMName = getVMInfoFromPathname(location.pathname);

      if (currentPageVMName) {
        setSelected(dataMap?.[`${ns}/${currentPageVMName}`]);
        return;
      }

      setSelected(dataMap?.[`${PROJECT_SELECTOR_PREFIX}/${ns}`]);
    };

    if (isEmpty(selected) || location.pathname !== selected.href) {
      if (ns) return;

      if (isAdmin) {
        selectAllNamespaces();
        return;
      }

      if (projectNamesLoaded) {
        if (selectFirstAccessibleProject()) return;
        if (selectDefaultProjectFallback()) return;
        setAlertMessage(t('User has no accessible namespaces for VirtualMachines'));
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
    setSelected,
    setAlertMessage,
  ]);

  return {
    alertMessage,
    onSelect,
    selected,
  };
};

export default useSelectNamespaceBasedOnPrivileges;
