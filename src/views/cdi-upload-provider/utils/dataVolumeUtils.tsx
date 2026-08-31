import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import type {
  V1beta1DataVolume,
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import type { K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { getGroupVersionKindForModel } from '@openshift-console/dynamic-plugin-sdk';

import { LABEL_CDROM_SOURCE } from './consts';
import { getKubevirtModelAvailableAPIVersion } from './selectors';

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

export const injectDisabled = (children: ReactNode, disabled: boolean): ReactNode => {
  const childArray = Array.isArray(children) ? children : [children];
  return childArray.map((child: ReactNode) => {
    if (!isValidElement(child) || child.type !== 'button') {
      return child;
    }

    const element = child as ReactElement<{ disabled?: boolean }>;
    return {
      ...element,
      props: { ...element.props, disabled: element.props.disabled || disabled },
    };
  });
};

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
    url += getGroupVersionKindForModel(model);
  } else if (plural) {
    url += plural;
  }

  if (name) {
    // Some resources have a name that needs to be encoded. For instance,
    // Users can have special characters in the name like `#`.
    url += `/${encodeURIComponent(name)}`;
  }

  return url;
};

const unknownKinds = new Set<string>();
/**
 * NOTE: This will not work for runtime-defined resources. Use a `connect`-ed component like `ResourceLink` instead.
 */
export const resourcePath = (
  modal: K8sModel,
  name?: string,
  namespace?: string,
): string | undefined => {
  if (!modal) {
    if (!unknownKinds.has(modal?.kind)) {
      unknownKinds.add(modal?.kind);
    }
    return;
  }

  return resourcePathFromModel(modal, name, namespace);
};
