import { DataVolumeModel, modelToRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import type {
  V1beta1DataVolume,
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { type K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { LABEL_CDROM_SOURCE } from './consts';
import { getKubevirtModelAvailableAPIVersion } from './selectors';

const unknownKinds = new Set<string>();

export const resourcePathFromModel = (
  model: K8sModel,
  name?: string,
  namespace?: string,
): string => {
  const { crd, namespaced, plural } = model;

  let url = '/k8s/';

  if (!namespaced) {
    url += 'cluster/';
  }

  if (namespaced) {
    url += namespace ? `ns/${namespace}/` : 'all-namespaces/';
  }

  if (crd) {
    url += modelToRef(model);
  } else if (plural) {
    url += plural;
  }

  if (name) {
    url += `/${encodeURIComponent(name)}`;
  }

  return url;
};

export const resourcePath = (
  modal: K8sModel,
  name?: string,
  namespace?: string,
): string | undefined => {
  if (!modal) {
    if (!unknownKinds.has(modal?.kind)) {
      unknownKinds.add(modal?.kind);
      kubevirtConsole.error(`resourcePath: no model for "${modal?.kind}"`);
    }
    return;
  }

  return resourcePathFromModel(modal, name, namespace);
};

type UpdateDVParams = {
  accessMode: string;
  mountAsCDROM: boolean;
  namespace: string;
  pvcName: string;
  requestSizeUnit: string;
  requestSizeValue: string;
  storageClassName: string;
  volumeMode: string;
};

export const updateDV = ({
  accessMode,
  mountAsCDROM,
  namespace,
  pvcName,
  requestSizeUnit,
  requestSizeValue,
  storageClassName,
  volumeMode,
}: UpdateDVParams): V1beta1DataVolume => {
  const obj: V1beta1DataVolume = {
    apiVersion: getKubevirtModelAvailableAPIVersion(DataVolumeModel),
    kind: DataVolumeModel.kind,
    metadata: {
      labels: {
        [LABEL_CDROM_SOURCE]: mountAsCDROM?.toString(),
      },
      name: pvcName,
      namespace,
    },
    spec: {
      source: {
        upload: {},
      },
      storage: {
        accessModes: [accessMode as V1beta1StorageSpecAccessModesEnum],
        resources: {
          requests: {
            storage: `${requestSizeValue}${requestSizeUnit}`,
          },
        },
        storageClassName,
        volumeMode: volumeMode as V1beta1StorageSpecVolumeModeEnum,
      },
    },
  };

  return obj;
};
