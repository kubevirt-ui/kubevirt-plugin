import { type MouseEvent, useEffect } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';

import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useLastNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
import { useSignals } from '@preact/signals-react/runtime';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import useTreeViewSelect from '../useTreeViewSelect';

import { FOLDER_SELECTOR_PREFIX, HIDE, SHOW_EMPTY_PROJECTS_KEY } from '../../utils/constants';
import { vmsSignal } from '../../utils/signals';
import {
  getEffectiveShowEmptyProjects,
  getVMInfoFromPathname,
  getVMTreeViewItemID,
  type TreeViewDataItemWithHref,
} from '../../utils/utils';
import {
  getProjectTreeItem,
  isProjectVisibleInTree,
  selectACMTreeItem,
  selectNamespaceOrFallback,
  type UseAutoSelectTreeViewItemProps,
} from './utils';

type UseAutoSelectTreeViewItemReturn = {
  onSelect: (_event: MouseEvent, treeViewItem: TreeViewDataItemWithHref) => void;
  selected: TreeViewDataItemWithHref;
};

const useAutoSelectTreeViewItem = ({
  dataMap,
  loaded,
}: UseAutoSelectTreeViewItemProps): UseAutoSelectTreeViewItemReturn => {
  useSignals();
  const [selected, onSelect, setSelected] = useTreeViewSelect();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [, setLastNamespace] = useLastNamespace();
  const isACMPage = useIsACMPage();

  const location = useLocation();
  const cluster = useClusterParam();
  const { ns } = useParams<{ ns: string }>();
  const [showEmptyProjects] = useLocalStorage(SHOW_EMPTY_PROJECTS_KEY, HIDE);
  const hasVMs = !isEmpty(vmsSignal.value);
  const effectiveShowEmptyProjects = getEffectiveShowEmptyProjects(hasVMs, showEmptyProjects);

  useEffect(() => {
    const { vmCluster, vmName, vmNamespace } = getVMInfoFromPathname(location.pathname);
    if (vmName && vmNamespace) {
      setSelected(dataMap?.[getVMTreeViewItemID(vmName, vmNamespace, vmCluster)]);
    }
  }, [location.pathname, dataMap, setSelected]);

  useEffect(() => {
    if (!isACMPage) return;
    const { vmName, vmNamespace } = getVMInfoFromPathname(location.pathname);
    if (vmName && vmNamespace) return;

    selectACMTreeItem(
      dataMap,
      cluster,
      ns,
      loaded,
      selected?.id,
      searchParams,
      effectiveShowEmptyProjects,
      setSelected,
      navigate,
    );
  }, [
    cluster,
    dataMap,
    effectiveShowEmptyProjects,
    isACMPage,
    loaded,
    location.pathname,
    navigate,
    ns,
    searchParams,
    selected?.id,
    setSelected,
  ]);

  useEffect(() => {
    if (isACMPage || runningTourSignal.value || !loaded) return;

    const { vmName, vmNamespace } = getVMInfoFromPathname(location.pathname);
    if (vmName && vmNamespace) return;

    const hasFolderFilter = searchParams.has(VirtualMachineRowFilterType.Group);
    const isFolderSelected =
      ns && selected?.id?.startsWith(`${FOLDER_SELECTOR_PREFIX}/${SINGLE_CLUSTER_KEY}/${ns}/`);

    if (isFolderSelected && hasFolderFilter) return;

    const fallbackArgs = {
      dataMap,
      effectiveShowEmptyProjects,
      navigate,
      ns,
      setLastNamespace,
      setSelected,
    };

    if (isFolderSelected && !hasFolderFilter && ns) {
      selectNamespaceOrFallback(fallbackArgs);
      return;
    }

    if (ns) {
      const projectTreeItem = getProjectTreeItem(dataMap, SINGLE_CLUSTER_KEY, ns);
      if (projectTreeItem && !isProjectVisibleInTree(projectTreeItem, effectiveShowEmptyProjects)) {
        selectNamespaceOrFallback(fallbackArgs);
        return;
      }
    }

    const selectedPathname = selected?.href?.split?.('?')?.[0];
    if (!selected?.id || location.pathname !== selectedPathname) {
      selectNamespaceOrFallback(fallbackArgs);
    }
  }, [
    dataMap,
    effectiveShowEmptyProjects,
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
  ]);

  return { onSelect, selected };
};

export default useAutoSelectTreeViewItem;
