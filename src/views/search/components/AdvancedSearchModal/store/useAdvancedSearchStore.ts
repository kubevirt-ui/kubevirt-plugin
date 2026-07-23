import produce from 'immer';
import isEqual from 'lodash/isEqual';
import { create } from 'zustand';

import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { AdvancedSearchInputs, AdvancedSearchQueryInputs } from '../../../utils/types';
import { DateSelectOption } from '../constants/dateSelect';
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
    initialize: (
      filterInputs: AdvancedSearchInputs,
      contextInputs: Pick<
        AdvancedSearchQueryInputs,
        VirtualMachineRowFilterType.Cluster | VirtualMachineRowFilterType.Project
      >,
    ) => void;
    resetForm: () => void;
    setField: SetAdvancedSearchField;
  };
  baseline: AdvancedSearchState;
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

  Object.keys(prefillInputs).forEach((key) => {
    const typedKey = key as keyof AdvancedSearchInputs;
    if (prefillInputs[typedKey] !== undefined) {
      (baseState as any)[typedKey] = prefillInputs[typedKey];
    }
  });

  return baseState;
};

const stripUIFields = ({
  dateOption: _dateOption,
  isValidDate: _isValidDate,
  labelInputText: _labelInputText,
  ...queryInputs
}: AdvancedSearchState) => queryInputs;

const isStateEmpty = (state: AdvancedSearchState, baseline: AdvancedSearchState): boolean =>
  isEqual(stripUIFields(state), stripUIFields(baseline));

const useAdvancedSearchStore = create<AdvancedSearchStore>()((set, get) => ({
  actions: {
    getSearchQueryInputs: () => {
      const { dateOption, isValidDate, labelInputText, ...queryInputs } = get().state;

      return queryInputs;
    },

    initialize: (filterInputs, contextInputs) =>
      set(
        produce((draft) => {
          draft.baseline = getInitialState(contextInputs);
          draft.state = getInitialState({ ...filterInputs, ...contextInputs });
        }),
      ),

    resetForm: () =>
      set(
        produce((draft) => {
          draft.state = draft.baseline;
        }),
      ),

    setField: (field) => (value) =>
      set(
        produce((draft) => {
          draft.state[field] = value;
        }),
      ),
  },

  baseline: getInitialState(),
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
  useAdvancedSearchStore(
    (store) => !store.state.isValidDate || isStateEmpty(store.state, store.baseline),
  );
