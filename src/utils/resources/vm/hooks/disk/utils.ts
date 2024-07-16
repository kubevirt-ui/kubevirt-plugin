import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1beta1DataVolumeSourcePVC, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  DataSourceModelGroupVersionKind,
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-utils/models';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { getDataVolumeTemplates, getVolumes } from '../../utils';

const PersistentVolumeClaimGroupVersionKind = modelToGroupVersionKind(PersistentVolumeClaimModel);

export const getDataSourceWatch = (vm: V1VirtualMachine) =>
  getDataVolumeTemplates(vm)
    ?.map((dataVolume) => dataVolume?.spec?.sourceRef)
    .filter((sourceRef) => Boolean(sourceRef))
    .reduce((acc, dataSource) => {
      acc[`${dataSource.name}-${dataSource.namespace}`] = {
        groupVersionKind: DataSourceModelGroupVersionKind,
        name: dataSource.name,
        namespace: dataSource.namespace,
      };

      return acc;
    }, {});

export const getPVCWatch = (vm: V1VirtualMachine, dataSources: V1beta1DataSource[]) => {
  const pvcSources = getDataVolumeTemplates(vm)?.map((dataVolume) => dataVolume?.spec?.source?.pvc);

  pvcSources.push(...dataSources.map((dataSource) => dataSource?.spec?.source?.pvc));

  pvcSources.push(
    ...(getVolumes(vm) || [])
      .map((volume) => volume?.persistentVolumeClaim?.claimName)
      .filter((claimName) => Boolean(claimName))
      .map(
        (claimName) =>
          ({ name: claimName, namespace: getNamespace(vm) } as V1beta1DataVolumeSourcePVC),
      ),
  );

  return pvcSources
    .filter((pvcSource) => !isEmpty(pvcSource))
    .reduce((acc, pvcSource) => {
      acc[`${pvcSource.name}-${pvcSource.namespace}`] = {
        groupVersionKind: PersistentVolumeClaimGroupVersionKind,
        name: pvcSource.name,
        namespace: pvcSource.namespace,
      };

      return acc;
    }, {});
};
