import { CLUSTER_LIST_FILTER_TYPE } from '@kubevirt-utils/utils/constants';
import { type TreeViewDataItem } from '@patternfly/react-core';

import {
  getClusterSetTreeItemMatchingClusterFilters,
  isClusterSetSelectedInQuery,
} from '../cluster-set/utils/clusterSetTreeSelection';
import { selectACMTreeItem } from '../hooks/useAutoSelectTreeViewItem/utils';
import {
  ALL_CLUSTERS_ID,
  CLUSTER_SELECTOR_PREFIX,
  CLUSTER_SET_SELECTOR_PREFIX,
  HIDE,
  PROJECT_SELECTOR_PREFIX,
  SHOW,
} from './constants';
import { buildTreeItemQuery } from './query-params/treeItemQuery';
import {
  filterNamespaceItems,
  getAllRightClickableTreeViewItems,
  getEffectiveShowEmptyProjects,
  isShowOnlyVMProjectsChecked,
} from './treeHelpers';
import { type TreeViewDataItemWithHref } from './utils';

const projectItem = (name: string, children?: TreeViewDataItem[]): TreeViewDataItem => ({
  children,
  id: `${PROJECT_SELECTOR_PREFIX}/#single-cluster#/${name}`,
  name,
});

describe('getEffectiveShowEmptyProjects', () => {
  it('should force SHOW when the cluster has no VirtualMachines', () => {
    expect(getEffectiveShowEmptyProjects(false, HIDE)).toBe(SHOW);
    expect(getEffectiveShowEmptyProjects(false, SHOW)).toBe(SHOW);
  });

  it('should use the stored preference when VirtualMachines exist', () => {
    expect(getEffectiveShowEmptyProjects(true, HIDE)).toBe(HIDE);
    expect(getEffectiveShowEmptyProjects(true, SHOW)).toBe(SHOW);
  });
});

describe('isShowOnlyVMProjectsChecked', () => {
  it('should be unchecked when the cluster has no VirtualMachines', () => {
    expect(isShowOnlyVMProjectsChecked(false, HIDE)).toBe(false);
    expect(isShowOnlyVMProjectsChecked(false, SHOW)).toBe(false);
  });

  it('should follow the stored preference when VirtualMachines exist', () => {
    expect(isShowOnlyVMProjectsChecked(true, HIDE)).toBe(true);
    expect(isShowOnlyVMProjectsChecked(true, SHOW)).toBe(false);
  });
});

describe('filterNamespaceItems', () => {
  it('should always include projects that have VirtualMachines', () => {
    const item = projectItem('app', [{ id: 'vm-1', name: 'vm-1' }]);

    expect(filterNamespaceItems(item, false)).toBe(true);
    expect(filterNamespaceItems(item, true)).toBe(true);
  });

  it('should hide empty non-system projects when showEmptyProjects is false', () => {
    expect(filterNamespaceItems(projectItem('app', []), false)).toBe(false);
  });

  it('should show empty non-system projects when showEmptyProjects is true', () => {
    expect(filterNamespaceItems(projectItem('app', []), true)).toBe(true);
  });

  it('should hide empty system namespaces even when showEmptyProjects is true', () => {
    expect(filterNamespaceItems(projectItem('openshift', []), true)).toBe(false);
    expect(filterNamespaceItems(projectItem('kube-system', []), true)).toBe(false);
  });

  it('should keep cluster set folders when child projects are filtered out', () => {
    const clusterSetItem: TreeViewDataItem = {
      children: [
        {
          children: [projectItem('empty-app', [])],
          id: `${CLUSTER_SELECTOR_PREFIX}/cluster-a`,
          name: 'cluster-a',
        },
      ],
      id: `${CLUSTER_SET_SELECTOR_PREFIX}/production`,
      name: 'production',
    };

    expect(filterNamespaceItems(clusterSetItem, false)).toBe(true);
  });
});

describe('ACM cluster set', () => {
  const productionSetItem: TreeViewDataItemWithHref = {
    children: [
      { id: `${CLUSTER_SELECTOR_PREFIX}/cluster-a`, name: 'cluster-a' },
      { id: `${CLUSTER_SELECTOR_PREFIX}/cluster-b`, name: 'cluster-b' },
    ],
    id: `${CLUSTER_SET_SELECTOR_PREFIX}/production`,
    name: 'production',
  };

  describe('tree helpers', () => {
    it('should exclude All clusters and cluster set nodes from right-click targets', () => {
      const clusterSetNode: TreeViewDataItem = {
        children: [{ id: `${CLUSTER_SELECTOR_PREFIX}/cluster-a`, name: 'cluster-a' }],
        id: `${CLUSTER_SET_SELECTOR_PREFIX}/production`,
        name: 'production',
      };

      const treeData: TreeViewDataItem[] = [
        {
          children: [
            clusterSetNode,
            { id: `${CLUSTER_SELECTOR_PREFIX}/cluster-b`, name: 'cluster-b' },
          ],
          id: ALL_CLUSTERS_ID,
          name: 'All clusters',
        },
      ];

      const rightClickableIds = getAllRightClickableTreeViewItems(treeData).map((item) => item.id);

      expect(rightClickableIds).not.toContain(`${CLUSTER_SET_SELECTOR_PREFIX}/production`);
      expect(rightClickableIds).toContain(`${CLUSTER_SELECTOR_PREFIX}/cluster-b`);
    });
  });

  describe('buildTreeItemQuery', () => {
    it('should append multiple cluster query params for a cluster set href', () => {
      const query = buildTreeItemQuery({ clusters: ['cluster-b', 'cluster-a'] });
      expect(query).toBe('?cluster=cluster-b&cluster=cluster-a');
    });

    it('should replace existing cluster params when clusters are provided', () => {
      const query = buildTreeItemQuery({
        clusters: ['cluster-a'],
        project: 'app',
        query: `${CLUSTER_LIST_FILTER_TYPE}=stale-cluster&project=old-app`,
      });
      const params = new URLSearchParams(query.slice(1));
      expect(params.getAll(CLUSTER_LIST_FILTER_TYPE)).toEqual(['cluster-a']);
      expect(params.get('project')).toBe('app');
    });
  });

  describe('clusterSetTreeSelection', () => {
    const dataMap: Record<string, TreeViewDataItemWithHref> = {
      [productionSetItem.id]: productionSetItem,
    };

    it('should match cluster set query params regardless of cluster order', () => {
      const query = `?${CLUSTER_LIST_FILTER_TYPE}=cluster-b&${CLUSTER_LIST_FILTER_TYPE}=cluster-a`;
      expect(isClusterSetSelectedInQuery(['cluster-a', 'cluster-b'], query)).toBe(true);
      expect(isClusterSetSelectedInQuery(['cluster-b', 'cluster-a'], query)).toBe(true);
    });

    it('should not treat a partial cluster selection as a full cluster set', () => {
      const query = `?${CLUSTER_LIST_FILTER_TYPE}=cluster-b&${CLUSTER_LIST_FILTER_TYPE}=cluster-a`;
      expect(isClusterSetSelectedInQuery(['cluster-a'], query)).toBe(false);
    });

    it('should resolve the cluster set tree item from multi-cluster query params', () => {
      expect(getClusterSetTreeItemMatchingClusterFilters(dataMap, ['cluster-b', 'cluster-a'])).toBe(
        productionSetItem,
      );
      expect(getClusterSetTreeItemMatchingClusterFilters(dataMap, ['cluster-a'])).toBeUndefined();
    });
  });

  describe('selectACMTreeItem', () => {
    const setSelected = jest.fn();
    const navigate = jest.fn();

    beforeEach(() => {
      setSelected.mockClear();
      navigate.mockClear();
    });

    it('should select the cluster set when fleet path has matching cluster query params', () => {
      const searchParams = new URLSearchParams(
        `${CLUSTER_LIST_FILTER_TYPE}=cluster-a&${CLUSTER_LIST_FILTER_TYPE}=cluster-b`,
      );
      const dataMap: Record<string, TreeViewDataItemWithHref> = {
        [ALL_CLUSTERS_ID]: { id: ALL_CLUSTERS_ID, name: 'All clusters' },
        [productionSetItem.id]: productionSetItem,
      };

      selectACMTreeItem(
        dataMap,
        undefined,
        undefined,
        true,
        undefined,
        searchParams,
        SHOW,
        setSelected,
        navigate,
      );

      expect(setSelected).toHaveBeenCalledWith(
        expect.objectContaining({ id: `${CLUSTER_SET_SELECTOR_PREFIX}/production` }),
      );
      expect(navigate).not.toHaveBeenCalled();
    });

    it('should not select when the tree is still loading', () => {
      selectACMTreeItem(
        { [ALL_CLUSTERS_ID]: { id: ALL_CLUSTERS_ID, name: 'All clusters' } },
        undefined,
        undefined,
        false,
        undefined,
        new URLSearchParams(),
        SHOW,
        setSelected,
        navigate,
      );

      expect(setSelected).not.toHaveBeenCalled();
    });
  });
});
