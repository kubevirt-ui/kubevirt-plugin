import { Children, cloneElement } from 'react';

import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1alpha1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  getGroupVersionKindForModel,
  k8sDelete,
  K8sModel,
} from '@openshift-console/dynamic-plugin-sdk';
import { ProgressVariant } from '@patternfly/react-core';

import { LABEL_CDROM_SOURCE, UPLOAD_STATUS } from './consts';
import { getKubevirtModelAvailableAPIVersion } from './selectors';
import { OperatingSystemRecord } from './types';

export const killCDIBoundPVC = (pvc: V1alpha1PersistentVolumeClaim) =>
  k8sDelete({
    model: DataVolumeModel,
    resource: pvc,
  });

export const getProgressVariant = (status: UPLOAD_STATUS) => {
  switch (status) {
    case UPLOAD_STATUS.ERROR:
      return ProgressVariant.danger;
    case UPLOAD_STATUS.SUCCESS:
      return ProgressVariant.success;
    default:
      return null;
  }
};

export const joinGrammaticallyListOfItems = (items: string[], separator = 'and') => {
  const result = items.join(', ');
  const lastCommaIdx = result.lastIndexOf(',');

  return items.length > 1 && lastCommaIdx >= 0
    ? `${result.substr(0, lastCommaIdx)} ${separator}${result.substr(lastCommaIdx + 1)}`
    : result;
};

export const injectDisabled = (children, disabled) => {
  return Children.map(children, (c) => {
    if (c?.type !== 'button') {
      return c;
    }

    return cloneElement(c, { disabled: c.props.disabled || disabled });
  });
};

const unknownKinds = new Set();

export const resourcePathFromModel = (model: K8sModel, name?: string, namespace?: string) => {
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

/**
 * NOTE: This will not work for runtime-defined resources. Use a `connect`-ed component like `ResourceLink` instead.
 */
export const resourcePath = (modal: K8sModel, name?: string, namespace?: string) => {
  if (!modal) {
    if (!unknownKinds.has(modal?.kind)) {
      unknownKinds.add(modal?.kind);
      // eslint-disable-next-line no-console
      console.error(`resourcePath: no model for "${modal?.kind}"`);
    }
    return;
  }

  return resourcePathFromModel(modal, name, namespace);
};

export const stringValueUnitSplit = (combinedVal) => {
  const index = combinedVal.search(/([a-zA-Z]+)/g);
  let value;
  let unit;
  if (index === -1) {
    value = combinedVal;
  } else {
    value = combinedVal.slice(0, index);
    unit = combinedVal.slice(index);
  }
  return [value, unit];
};

const splitVersion = (osID: string): number[] =>
  (osID || '')
    .split(/\D/)
    .filter((x) => x)
    .map((num) => parseInt(num));

export const compareVersions = (version1: string, version2: string): number => {
  if (!version1 && !version2) {
    return 0;
  }

  // 'devel' version if exist is always the highest version.
  if (version1 === 'devel') {
    return 1;
  }
  if (version2 === 'devel') {
    return -1;
  }

  const finalVersion1 = splitVersion(version1) || [];
  const finalVersion2 = splitVersion(version2) || [];

  const selectedArray =
    finalVersion1?.length > finalVersion2?.length ? finalVersion1 : finalVersion2;
  const zipped = selectedArray.map((_, index) => {
    return [finalVersion1?.[index], finalVersion2?.[index]];
  });
  let idx = 0;
  while (idx < zipped.length) {
    /*
      undefined values are equal to 0, eg:
      14.0 == 14 -> zipped = [[14,14],[0,undefined]]
      1.0.0 == 1 -> zipped = [[1,1],[0,undefined],[0,undefined]]
    */
    const ver1 = !zipped[idx][0] ? 0 : zipped[idx][0];
    const ver2 = !zipped[idx][1] ? 0 : zipped[idx][1];

    if (ver1 > ver2) {
      return 1;
    }

    if (ver2 > ver1) {
      return -1;
    }

    idx++;
  }

  return 0;
};

const descSortOSes = (os1: OperatingSystemRecord, os2: OperatingSystemRecord): number => {
  const nameCMP = (os1.name || '').localeCompare(os2.name || '');
  if (nameCMP !== 0) {
    return nameCMP * -1;
  }

  return compareVersions(os1.id, os2.id) * -1;
};

export const removeOSDups = (osArr: OperatingSystemRecord[]): OperatingSystemRecord[] => {
  const osNames = new Set<string>();
  return osArr
    .reduce((acc, os) => {
      if (os?.name && !osNames.has(os?.name)) {
        osNames.add(os?.name);
        acc.push(os);
      }
      return acc;
    }, [])
    .sort(descSortOSes);
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
}): V1beta1DataVolume => {
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
        accessModes: [accessMode],
        resources: {
          requests: {
            storage: `${requestSizeValue}${requestSizeUnit}`,
          },
        },
        storageClassName,
        volumeMode,
      },
    },
  };

  return obj;
};
