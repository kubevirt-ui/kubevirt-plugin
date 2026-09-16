import { type V1VirtualMachine, type V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { type VolumeTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import {
  buildOwnerReference,
  compareOwnerReferences,
  getNamespace,
} from '@kubevirt-utils/resources/shared';
import { type K8sModel, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk-internal/lib/extensions/console-types';

import { mapVolumeTypeToK8sModel } from './utils/constants';
import { getVolumeResourceName, getVolumeType } from './utils/utils';

type UseVolumeOwnedResource = (
  vm: V1VirtualMachine,
  volume: V1Volume,
) => {
  error: Error;
  loaded: boolean;
  volumeResource: K8sResourceCommon;
  volumeResourceModel: K8sModel | null;
  volumeResourceName: string;
};

const useVolumeOwnedResource: UseVolumeOwnedResource = (vm, volume) => {
  const volumeType = getVolumeType(volume);
  const volumeResourceModel = mapVolumeTypeToK8sModel[volumeType as VolumeTypes];
  const volumeGroupVersionKind = volumeResourceModel
    ? modelToGroupVersionKind(volumeResourceModel)
    : null;

  const volumeResourceName = getVolumeResourceName(volume);
  const watchVolumeResource =
    volumeGroupVersionKind && volumeResourceName
      ? {
          groupVersionKind: volumeGroupVersionKind,
          isList: false,
          name: volumeResourceName,
          namespace: getNamespace(vm),
        }
      : null;
  const [resource, loaded, error] = useK8sWatchResource<K8sResourceCommon>(
    watchVolumeResource ?? null,
  );

  if (!watchVolumeResource) {
    return {
      error: error,
      loaded: true,
      volumeResource: null,
      volumeResourceModel: null,
      volumeResourceName: null,
    };
  }
  const volumeResourceReference = resource?.metadata?.ownerReferences?.find((ownerRef) => {
    const vmOwnerRef = buildOwnerReference(vm);
    return compareOwnerReferences(ownerRef, vmOwnerRef);
  });
  return {
    error: error,
    loaded: loaded,
    volumeResource: volumeResourceReference ? resource : null,
    volumeResourceModel,
    volumeResourceName,
  };
};

export default useVolumeOwnedResource;
