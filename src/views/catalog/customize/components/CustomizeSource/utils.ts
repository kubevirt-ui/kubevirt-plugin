import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { SOURCE_OPTIONS_IDS } from './constants';

export const getGenericSourceCustomization = (
  diskSourceId: SOURCE_OPTIONS_IDS,
  url: string,
  storage: string,
): V1beta1DataVolumeSpec => {
  return {
    pvc: {
      accessModes: ['ReadWriteOnce'],
      resources: {
        requests: {
          storage,
        },
      },
    },
    source: {
      [diskSourceId]: {
        url,
      },
    },
  };
};

export const getPVCSource = (pvcName: string, pvcNamespace: string): V1beta1DataVolumeSpec => ({
  source: {
    pvc: {
      name: pvcName,
      namespace: pvcNamespace,
    },
  },
});
