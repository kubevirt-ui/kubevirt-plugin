import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export type SearchKeyBadge = {
  description: string;
  displayKey: string;
  filterType: VirtualMachineRowFilterType;
  usesColon?: boolean;
};

export type SearchExample = {
  description: string;
  query: string;
};
