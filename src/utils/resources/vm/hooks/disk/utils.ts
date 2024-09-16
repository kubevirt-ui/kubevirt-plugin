import { V1beta1DataVolumeSourcePVC, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { getDataVolumeTemplates, getVolumes } from '../../utils';

const PersistentVolumeClaimGroupVersionKind = modelToGroupVersionKind(PersistentVolumeClaimModel);

export const getPVCWatch = (vm: V1VirtualMachine) => {
  const pvcSources = getDataVolumeTemplates(vm)?.map((dataVolume) => ({
    name: getName(dataVolume),
    namespace: getNamespace(vm),
  }));

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
