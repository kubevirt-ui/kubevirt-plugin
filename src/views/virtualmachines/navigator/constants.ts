export const VM_LIST_TAB_PARAM = 'tab';
export const VM_LIST_TAB_OVERVIEW = 'overview';
export const VM_LIST_TAB_VMS = 'vms';

export const OVERVIEW_TAB_INDEX = 0;
export const VM_LIST_TAB_INDEX = 1;

export const TAB_KEY_MAP: Record<string, number> = {
  [VM_LIST_TAB_OVERVIEW]: OVERVIEW_TAB_INDEX,
  [VM_LIST_TAB_VMS]: VM_LIST_TAB_INDEX,
};

export const TAB_INDEX_MAP: Record<number, string> = {
  [OVERVIEW_TAB_INDEX]: VM_LIST_TAB_OVERVIEW,
  [VM_LIST_TAB_INDEX]: VM_LIST_TAB_VMS,
};
