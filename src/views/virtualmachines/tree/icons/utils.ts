import { type FC } from 'react';

import { printableVMStatus } from '@virtualmachines/utils';

import PausedVirtualMachineIcon from './PausedVirtualMachineIcon';
import RunningVirtualMachineIcon from './RunningVirtualMachineIcon';
import StoppedVirtualMachineIcon from './StoppedVirtualMachineIcon';
import TreeViewVirtualMachineIcon from './TreeViewVirtualMachineIcon';

const statusIconMapper: Record<string, FC> = {
  [printableVMStatus.Paused]: PausedVirtualMachineIcon,
  [printableVMStatus.Running]: RunningVirtualMachineIcon,
  [printableVMStatus.Stopped]: StoppedVirtualMachineIcon,
};

export const statusIcon = new Proxy(statusIconMapper, {
  get(target, prop: string): FC {
    return target[prop] ?? TreeViewVirtualMachineIcon;
  },
});
