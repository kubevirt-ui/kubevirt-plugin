import { useEffect } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';

import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import { ALL_NAMESPACES, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { getVMListURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useLastNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
import { TEXT_FILTER_LABELS_ID } from '@virtualmachines/list/hooks/constants';

import { FOLDER_SELECTOR_PREFIX, HIDE, SHOW_EMPTY_NAMESPACES_KEY } from '../../utils/constants';
import { getVMInfoFromPathname, getVMTreeViewItemID } from '../../utils/utils';
import useTreeViewSelect from '../useTreeViewSelect';

import {
  getClusterTreeItem,
  getNamespaceTreeItem,
  isNamespaceVisibleInTree,
  UseAutoSelectTreeViewItemProps,
} from './utils';

const useAutoSelectTreeViewItem = ({
  dataMap,
  loaded,
  onFilterChange,
}: UseAutoSelectTreeViewItemProps) => {
  const [selected, onSelect, setSelected] = useTreeViewSelect(onFilterChange);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [, setLastNamespace] = useLastNamespace();
  const isACMPage = useIsACMPage();

  const location = useLocation();
  const cluster = useClusterParam();
  const { ns } = useParams<{ ns: string }>();
  const [showEmptyNamespaces] = useLocalStorage(SHOW_EMPTY_NAMESPACES_KEY, HIDE);

  // Select VM tree view item based on path
  useEffect(() => {
    const { vmCluster, vmName, vmNamespace } = getVMInfoFromPathname(location.pathname);
    if (vmName && vmNamespace) {
      setSelected(dataMap?.[getVMTreeViewItemID(vmName, vmNamespace, vmCluster)]);
    }
  }, [location.pathname, dataMap, setSelected]);

  // Select cluster or namesspace tree view item when on ACM page (only when not viewing a specific VM)
  useEffect(() => {
    if (!isACMPage) return;

    const { vmName, vmNamespace } = getVMInfoFromPathname(location.pathname);
    if (vmName && vmNamespace) return;

    if (ns && cluster && loaded) {
      const folderPrefix = `${FOLDER_SELECTOR_PREFIX}/${cluster}/${ns}/`;
      const hasFolderFilter = searchParams.has(TEXT_FILTER_LABELS_ID);
      if (selected?.id?.startsWith(folderPrefix) && hasFolderFilter) return;

      const namespaceTreeItem = getNamespaceTreeItem(dataMap, cluster, ns);

      if (namespaceTreeItem && isNamespaceVisibleInTree(namespaceTreeItem, showEmptyNamespaces)) {
        if (selected?.id !== namespaceTreeItem.id) {
          setSelected(namespaceTreeItem);
        }
        return;
      }

      // Namespace is hidden by the filter — fall back to the cluster view
      const clusterTreeItem = getClusterTreeItem(dataMap, cluster);
      if (clusterTreeItem?.href) {
        setSelected(clusterTreeItem);
        navigate(clusterTreeItem.href);
      }
      return;
    }

    const clusterTreeItem = getClusterTreeItem(dataMap, cluster);
    if (clusterTreeItem && selected?.id !== clusterTreeItem.id) {
      setSelected(clusterTreeItem);
    }
  }, [
    cluster,
    dataMap,
    isACMPage,
    loaded,
    location.pathname,
    navigate,
    ns,
    searchParams,
    selected?.id,
    setSelected,
    showEmptyNamespaces,
  ]);

  // Select namespace based on current URL and filter state
  useEffect(() => {
    if (isACMPage || runningTourSignal.value || !loaded) return;

    const hasFolderFilter = searchParams.has(TEXT_FILTER_LABELS_ID);
    const isFolderSelected =
      ns && selected?.id?.startsWith(`${FOLDER_SELECTOR_PREFIX}/${SINGLE_CLUSTER_KEY}/${ns}/`);

    if (isFolderSelected && hasFolderFilter) return;

    const selectAllNamespaces = () => {
      setSelected(dataMap?.[ALL_NAMESPACES_SESSION_KEY]);
      setLastNamespace(ALL_NAMESPACES);
    };

    /**
     * Selects the tree node for the current namespace (ns) if it is visible in the tree.
     * Navigates to the all-namespaces list and selects the root node when:
     *  - ns is undefined (all-namespaces URL), or
     *  - the namespace has no VMs and the "show only namespaces with VMs" filter hides it.
     * navigate() and selectAllNamespaces() always run together so the URL and tree
     * selection stay in sync.
     */
    const selectNamespaceOrFallback = (): void => {
      if (ns) {
        const namespaceTreeItem = getNamespaceTreeItem(dataMap, SINGLE_CLUSTER_KEY, ns);

        if (namespaceTreeItem && isNamespaceVisibleInTree(namespaceTreeItem, showEmptyNamespaces)) {
          setSelected(namespaceTreeItem);
          return;
        }

        navigate(getVMListURL());
      }

      selectAllNamespaces();
    };

    if (isFolderSelected && !hasFolderFilter && ns) {
      selectNamespaceOrFallback();
      return;
    }

    // Always redirect away from a namespace that is hidden by the filter, even when
    // the URL already matches the selection (e.g. filter toggled while on the page).
    if (ns) {
      const namespaceTreeItem = getNamespaceTreeItem(dataMap, SINGLE_CLUSTER_KEY, ns);

      if (namespaceTreeItem && !isNamespaceVisibleInTree(namespaceTreeItem, showEmptyNamespaces)) {
        selectNamespaceOrFallback();
        return;
      }
    }

    if (!selected?.id || location.pathname !== selected?.href) {
      selectNamespaceOrFallback();
      return;
    }
  }, [
    dataMap,
    isACMPage,
    loaded,
    location.pathname,
    navigate,
    ns,
    searchParams,
    selected?.href,
    selected?.id,
    setLastNamespace,
    setSelected,
    showEmptyNamespaces,
  ]);

  return {
    onSelect,
    selected,
  };
};

export default useAutoSelectTreeViewItem;
