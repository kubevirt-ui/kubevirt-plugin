import {
  type V1beta1DataSource,
  type V1beta1DataVolume,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const getProvisioningDataSources = (
  dataSources: V1beta1DataSource[],
  dvs: V1beta1DataVolume[],
  readyOrCloningDataSources: V1beta1DataSource[],
): V1beta1DataSource[] => {
  if (isEmpty(dataSources) || isEmpty(dvs)) return [];

  const key = (res: K8sResourceCommon): string => `${getNamespace(res)}/${getName(res)}`;
  const readyKeys = new Set(readyOrCloningDataSources.map(key));
  return dataSources.filter((src) => {
    if (readyKeys.has(key(src))) return false;
    return dvs.some(
      (vol) => getName(vol) === getName(src) && getNamespace(vol) === getNamespace(src),
    );
  });
};
