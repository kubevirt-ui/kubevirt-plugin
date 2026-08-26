import { type TreeViewDataItem } from '@patternfly/react-core';

import { HIDE, PROJECT_SELECTOR_PREFIX, SHOW } from './constants';
import {
  filterNamespaceItems,
  getEffectiveShowEmptyProjects,
  isShowOnlyVMProjectsChecked,
} from './treeHelpers';

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
});
