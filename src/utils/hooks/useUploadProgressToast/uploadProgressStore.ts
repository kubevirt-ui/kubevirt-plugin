import { create } from 'zustand';

import { type UploadProgressStoreState } from './types';
import { createUploadsActions } from './uploads/utils/utils';

export const useUploadProgressStore = create<UploadProgressStoreState>((set, get) => ({
  uploads: {
    actions: createUploadsActions(set, get),
    data: {},
    generationsByKey: {},
  },
}));

export const resetUploadProgressStore = (): void => {
  useUploadProgressStore.setState((state) => ({
    uploads: {
      ...state.uploads,
      data: {},
      generationsByKey: {},
    },
  }));
};
