import produce from 'immer';
import isEqual from 'lodash/isEqual';
import { create } from 'zustand';

import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { type AdvancedSearchInputs, type AdvancedSearchQueryInputs } from '../../../utils/types';
import { type DateSelectOption } from '../constants/dateSelect';
import {
  initialGuestAgent,
  initialHWDevices,
  initialMemory,
  initialScheduling,
  initialVCPU,
} from '../constants/initialValues';

type AdvancedSearchState = AdvancedSearchInputs & {
  dateOption?: DateSelectOption;
  isValidDate?: boolean;
};

type SetAdvancedSearchField = <K extends keyof AdvancedSearchState>(
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
    [VirtualMachineRowFilterType.DateCreated]: '',
    [VirtualMachineRowFilterType.DateCreatedFrom]: '',
    [VirtualMachineRowFilterType.DateCreatedTo]: '',
    [VirtualMachineRowFilterType.Description]: '',
    [VirtualMachineRowFilterType.Group]: [],
    [VirtualMachineRowFilterType.GuestAgent]: initialGuestAgent,
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

  for (const key of Object.keys(prefillInputs)) {
    const typedKey = key as keyof AdvancedSearchInputs;
    if (prefillInputs[typedKey] !== undefined) {
      (baseState as Record<string, unknown>)[typedKey] = prefillInputs[typedKey];
    }
  }

  return baseState;
};

const isStateEmpty = (state: AdvancedSearchState): boolean => {
  const initialState = getInitialState();
  const {
    dateOption: _dateOption,
    isValidDate: _isValidDate,
    labelInputText: _labelInputText,
    ...currentQueryInputs
  } = state;
  const {
    dateOption: _dateOptionInit,
    isValidDate: _isValidDateInit,
    labelInputText: _labelInputTextInit,
    ...initialQueryInputs
  } = initialState;
  return isEqual(currentQueryInputs, initialQueryInputs);
};

const useAdvancedSearchStore = create<AdvancedSearchStore>()((set, get) => ({
  actions: {
    getSearchQueryInputs: (): AdvancedSearchInputs => {
      const {
        dateOption: _dateOption,
        isValidDate: _isValidDate,
        labelInputText: _labelInputText,
        ...queryInputs
      } = get().state;

      return queryInputs;
    },

    initializeWithPrefill: (prefillInputs): void =>
      set(
        produce((draft) => {
          draft.state = getInitialState(prefillInputs);
        }),
      ),

    resetForm: (): void =>
      set(
        produce((draft) => {
          draft.state = getInitialState();
        }),
      ),

    setField:
      (field) =>
      (value): void =>
        set(
          produce((draft) => {
            draft.state[field] = value;
          }),
        ),
  },

  state: getInitialState(),
}));

export const useAdvancedSearchActions = (): {
  getSearchQueryInputs: () => AdvancedSearchQueryInputs;
  initializeWithPrefill: (prefillInputs: AdvancedSearchInputs) => void;
  resetForm: () => void;
  setField: SetAdvancedSearchField;
} => useAdvancedSearchStore((store) => store.actions);

export const useAdvancedSearchField = <K extends keyof AdvancedSearchState>(
  field: K,
): { setValue: (value: AdvancedSearchState[K]) => void; value: AdvancedSearchState[K] } =>
  useAdvancedSearchStore((store) => {
    return {
      setValue: store.actions.setField(field),
      value: store.state[field],
    };
  });

export const useIsSearchDisabled = (): boolean =>
  useAdvancedSearchStore((store) => !store.state.isValidDate || isStateEmpty(store.state));
