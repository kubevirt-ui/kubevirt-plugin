import { create } from 'zustand';

import { createExportDiskActions } from './features/exportDisk/utils/utils';
import { createUploadsActions } from './features/uploads/utils/utils';
import { createWatchedResourcesActions } from './features/watchedResources/utils/utils';
import { type InFlightToastStoreState } from './types';

export const useInFlightToastStore = create<InFlightToastStoreState>((set, get) => ({
  exportDisk: {
    actions: createExportDiskActions(set, get),
    data: {},
    generationsByKey: {},
  },
  uploads: {
    actions: createUploadsActions(set, get),
    data: {},
    generationsByKey: {},
  },
  watchedResources: {
    actions: createWatchedResourcesActions(set, get),
    data: {},
  },
}));

export const resetInFlightToastStore = (): void => {
  useInFlightToastStore.setState((state) => ({
    exportDisk: { ...state.exportDisk, data: {}, generationsByKey: {} },
    uploads: { ...state.uploads, data: {}, generationsByKey: {} },
    watchedResources: { ...state.watchedResources, data: {} },
  }));
};
