import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom-v5-compat';
import { useNavigate, useSearchParams } from 'react-router-dom-v5-compat';

import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import { ALL_NAMESPACES, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { useLastNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';

import { getVMTreeViewItemID, TreeViewDataItemWithHref } from '../utils/utils';
import { getVMInfoFromPathname } from '../utils/utils';

import useTreeViewSelect from './useTreeViewSelect';

type UseAutoSelectTreeViewItemProps = {
  dataMap: Record<string, TreeViewDataItemWithHref>;
  onFilterChange?: OnFilterChange;
};

const useAutoSelectTreeViewItem = ({ dataMap, onFilterChange }: UseAutoSelectTreeViewItemProps) => {
  const [selected, onSelect, setSelected] = useTreeViewSelect(onFilterChange);

  const { t } = useKubevirtTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [, setLastNamespace] = useLastNamespace();
  const isAdmin = useIsAdmin();
  const isACMPage = useIsACMPage();

  const [projectNames, projectNamesLoaded] = useProjects();
  const [alertMessage, setAlertMessage] = useState<string>(null);

  const location = useLocation();
  const cluster = useClusterParam();
  const { ns } = useParams<{ ns: string }>();

  // Select VM tree view item based on path
  useEffect(() => {
    const { vmCluster, vmName, vmNamespace } = getVMInfoFromPathname(location.pathname);
    if (vmName && vmNamespace) {
      setSelected(dataMap?.[getVMTreeViewItemID(vmName, vmNamespace, vmCluster)]);
    }
  }, [location.pathname, dataMap, setSelected]);

  // Select namespace based on privileges
  useEffect(() => {
    if (isACMPage || runningTourSignal.value) return;

    const selectAllNamespaces = () => {
      setSelected(dataMap?.[ALL_NAMESPACES_SESSION_KEY]);
      setLastNamespace(ALL_NAMESPACES);
    };

    if (isEmpty(selected) || location.pathname !== selected.href) {
      if (ns) return;

      selectAllNamespaces();
      return;
    }
  }, [
    dataMap,
    location.pathname,
    cluster,
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
    isACMPage,
  ]);

  return {
    alertMessage,
    onSelect,
    selected,
  };
};

export default useAutoSelectTreeViewItem;
