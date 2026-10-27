import { create } from 'zustand';

import { createExportDiskActions } from './exportDisk/utils/utils';
import { type UploadProgressStoreState } from './types';
import { createUploadsActions } from './uploads/utils/utils';

export const useUploadProgressStore = create<UploadProgressStoreState>((set, get) => ({
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
}));

export const resetUploadProgressStore = (): void => {
  useUploadProgressStore.setState((state) => ({
    exportDisk: {
      ...state.exportDisk,
      data: {},
      generationsByKey: {},
    },
    uploads: {
      ...state.uploads,
      data: {},
      generationsByKey: {},
    },
  }));
};
