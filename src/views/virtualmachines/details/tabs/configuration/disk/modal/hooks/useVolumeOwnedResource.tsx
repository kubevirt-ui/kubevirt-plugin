import { V1beta1CDIConfig } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1VirtualMachine, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { mapVolumeTypeToK8sModel } from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/constants';
import {
  getVolumeResourceName,
  getVolumeType,
} from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/helpers';
import { CDIConfigModelGroupVersionKind, modelToGroupVersionKind } from '@kubevirt-utils/models';
import { buildOwnerReference, compareOwnerReferences } from '@kubevirt-utils/resources/shared';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk-internal/lib/api/common-types';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk-internal/lib/extensions/console-types';

import { convertDataVolumeToPVC } from './utils/utils';

type UseVolumeOwnedResource = (
  vm: V1VirtualMachine,
  volume: V1Volume,
) => {
  error: Error;
  loaded: boolean;
  volumeResource: K8sResourceCommon;
  volumeResourceModel: K8sModel;
  volumeResourceName: string;
};

const useVolumeOwnedResource: UseVolumeOwnedResource = (vm, volume) => {
  const [cdiConfig, isCdiConfigLoaded, isCdiConfigError] = useK8sWatchResource<V1beta1CDIConfig>({
    groupVersionKind: CDIConfigModelGroupVersionKind,
    isList: false,
    namespaced: false,
  });

  const updatedVolume = volume.dataVolume ? convertDataVolumeToPVC(volume, cdiConfig) : volume;
  const volumeType = getVolumeType(updatedVolume);
  const volumeResourceModel = mapVolumeTypeToK8sModel[volumeType];
  const volumeResourceName = getVolumeResourceName(volume);
  const watchVolumeResource = {
    groupVersionKind: volumeResourceModel && modelToGroupVersionKind(volumeResourceModel),
    isList: false,
    name: volumeResourceName,
    namespace: vm.metadata.namespace,
  };
  const [resource, loaded, error] = useK8sWatchResource<K8sResourceCommon>(watchVolumeResource);

  if (!volumeResourceModel || !volumeResourceName) {
    return {
      error: error || isCdiConfigError,
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
    error: error || isCdiConfigError,
    loaded: loaded && isCdiConfigLoaded,
    volumeResource: volumeResourceReference ? resource : null,
    volumeResourceModel,
    volumeResourceName,
  };
};

export default useVolumeOwnedResource;
