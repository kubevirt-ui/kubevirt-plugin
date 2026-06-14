import { TFunction } from 'i18next';

import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export type SearchKeyBadge = {
  filterType: VirtualMachineRowFilterType;
  getDescription: (t: TFunction) => string;
  searchKey: string;
  usesColon?: boolean;
};

export type SearchExample = {
  description: string;
  query: string;
};

export enum DropdownType {
  HIDDEN = 'hidden',
  KEYS = 'keys',
  VALUES = 'values',
}

export type ValueOption = { label: string; value: string };

export type AutocompleteMode =
  | {
      activeSegment: string;
      filterType: string;
      searchKey: string;
      selectedValues: string[];
      type: DropdownType.VALUES;
    }
  | { filterText: string; type: DropdownType.KEYS }
  | { type: DropdownType.HIDDEN };
