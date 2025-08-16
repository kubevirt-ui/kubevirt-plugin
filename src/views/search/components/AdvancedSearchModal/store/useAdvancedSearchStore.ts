import produce from 'immer';
import { create } from 'zustand';

import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { AdvancedSearchInputs, AdvancedSearchQueryInputs } from '../../../utils/types';
import { DateSelectOption } from '../constants/dateSelect';
import {
  initialHWDevices,
  initialMemory,
  initialScheduling,
  initialVCPU,
} from '../constants/initialValues';

export type AdvancedSearchState = AdvancedSearchInputs & {
  dateOption?: DateSelectOption;
  isValidDate?: boolean;
};

export type SetAdvancedSearchField = <K extends keyof AdvancedSearchState>(
  field: K,
) => (value: AdvancedSearchState[K]) => void;

type AdvancedSearchStore = {
  actions: {
    getSearchQueryInputs: () => AdvancedSearchQueryInputs;
    initializeWithPrefill: (prefillInputs: AdvancedSearchInputs) => void;
    resetForm: () => void;
    setField: SetAdvancedSearchField;
  };
  state: AdvancedSearchState;
};

const getInitialState = (prefillInputs: AdvancedSearchInputs = {}): AdvancedSearchState => {
  const baseState: AdvancedSearchState = {
    dateOption: undefined,
    isValidDate: true,
    labelInputText: '',
    [VirtualMachineRowFilterType.Architecture]: [],
    [VirtualMachineRowFilterType.Cluster]: [],
    [VirtualMachineRowFilterType.CPU]: initialVCPU,
    [VirtualMachineRowFilterType.DateCreatedFrom]: '',
    [VirtualMachineRowFilterType.DateCreatedTo]: '',
    [VirtualMachineRowFilterType.Description]: '',
    [VirtualMachineRowFilterType.HWDevices]: initialHWDevices,
    [VirtualMachineRowFilterType.IP]: '',
    [VirtualMachineRowFilterType.Labels]: [],
    [VirtualMachineRowFilterType.Memory]: initialMemory,
    [VirtualMachineRowFilterType.NAD]: [],
    [VirtualMachineRowFilterType.Name]: '',
    [VirtualMachineRowFilterType.Node]: [],
    [VirtualMachineRowFilterType.OS]: [],
    [VirtualMachineRowFilterType.Project]: [],
    [VirtualMachineRowFilterType.Scheduling]: initialScheduling,
    [VirtualMachineRowFilterType.Status]: [],
    [VirtualMachineRowFilterType.StorageClass]: [],
  };

  Object.keys(prefillInputs).forEach((key) => {
    const typedKey = key as keyof AdvancedSearchInputs;
    if (prefillInputs[typedKey] !== undefined) {
      (baseState as any)[typedKey] = prefillInputs[typedKey];
    }
  });

  return baseState;
};

const useAdvancedSearchStore = create<AdvancedSearchStore>()((set, get) => ({
  actions: {
    getSearchQueryInputs: () => {
      const { dateOption, isValidDate, labelInputText, ...queryInputs } = get().state;

      return queryInputs;
    },

    initializeWithPrefill: (prefillInputs) =>
      set(
        produce((draft) => {
          draft.state = getInitialState(prefillInputs);
        }),
      ),

    resetForm: () =>
      set(
        produce((draft) => {
          draft.state = getInitialState();
        }),
      ),

    setField: (field) => (value) =>
      set(
        produce((draft) => {
          draft.state[field] = value;
        }),
      ),
  },

  state: getInitialState(),
}));

export const useAdvancedSearchActions = () => useAdvancedSearchStore((store) => store.actions);

export const useAdvancedSearchField = <K extends keyof AdvancedSearchState>(field: K) =>
  useAdvancedSearchStore((store) => {
    return {
      setValue: store.actions.setField(field),
      value: store.state[field],
    };
  });

export const useIsSearchDisabled = () =>
  useAdvancedSearchStore((store) => !store.state.isValidDate);
