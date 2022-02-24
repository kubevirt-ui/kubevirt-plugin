import { DISK_SOURCE, DISK_SOURCE_OPTIONS_IDS } from './constants';

export const getGenericDiskSourceCustomization = (
  diskSourceId: DISK_SOURCE_OPTIONS_IDS,
  url: string,
  storage,
): DISK_SOURCE => {
  return {
    storage,
    source: {
      [diskSourceId]: {
        url,
      },
    },
  };
};

export const getPVCDiskSource = (pvcName: string, pvcNamespace: string): DISK_SOURCE => ({
  source: {
    pvc: {
      name: pvcName,
      namespace: pvcNamespace,
    },
  },
});
