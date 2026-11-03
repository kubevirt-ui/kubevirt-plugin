import { type ExportDiskStoreState } from './features/exportDisk/types/types';
import { type UploadsStoreSlice } from './features/uploads/types/types';

export type InFlightToastStoreState = {
  exportDisk: ExportDiskStoreState;
  uploads: UploadsStoreSlice;
};

export type InFlightToastStoreStateSetter = (
  partial:
    | Partial<InFlightToastStoreState>
    | ((state: InFlightToastStoreState) => Partial<InFlightToastStoreState>),
) => void;

type InFlightToastStoreStateGetter = () => InFlightToastStoreState;

export type InFlightToastStoreActionsParams = {
  get: InFlightToastStoreStateGetter;
  set: InFlightToastStoreStateSetter;
};
