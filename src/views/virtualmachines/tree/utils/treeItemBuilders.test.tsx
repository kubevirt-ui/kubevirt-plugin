import type React from 'react';
import { isValidElement } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import StoppedVirtualMachineIcon from '../icons/StoppedVirtualMachineIcon';
import TreeViewVirtualMachineIcon from '../icons/TreeViewVirtualMachineIcon';
import { buildProjectMap } from './treeItemBuilders';

const vmWithoutStatus = {
  metadata: { name: 'rhel9-tour-guide', namespace: 'default' },
} as V1VirtualMachine;

const stoppedVM = {
  metadata: { name: 'stopped-vm', namespace: 'default' },
  status: { printableStatus: 'Stopped' },
} as V1VirtualMachine;

const getItemIconType = (vm: V1VirtualMachine) => {
  const projectMap = buildProjectMap([vm], '', '', {}, false);
  const icon = projectMap.default.ungrouped[0].icon;

  expect(isValidElement(icon)).toBe(true);

  return (icon as React.ReactElement).type;
};

describe('buildProjectMap', () => {
  it('uses the fallback tree icon when printableStatus is missing', () => {
    expect(getItemIconType(vmWithoutStatus)).toBe(TreeViewVirtualMachineIcon);
  });

  it('uses the stopped icon for Stopped VMs', () => {
    expect(getItemIconType(stoppedVM)).toBe(StoppedVirtualMachineIcon);
  });
});
