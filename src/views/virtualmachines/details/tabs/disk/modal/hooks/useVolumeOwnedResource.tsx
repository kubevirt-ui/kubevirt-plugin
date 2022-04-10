import { V1VirtualMachine, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { mapVolumeTypeToK8sModel } from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/constants';
import {
  getVolumeResourceName,
  getVolumeType,
} from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/helpers';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { buildOwnerReference, compareOwnerReferences } from '@kubevirt-utils/resources/shared';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk-internal/lib/api/common-types';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk-internal/lib/extensions/console-types';

type UseVolumeOwnedResource = (
  vm: V1VirtualMachine,
  volume: V1Volume,
) => {
  volumeResource: K8sResourceCommon;
  loaded: boolean;
  volumeResourceModel: K8sModel;
  volumeResourceName: string;
};

const useVolumeOwnedResource: UseVolumeOwnedResource = (vm, volume) => {
  const volumeType = getVolumeType(volume);
  const volumeResourceModel = mapVolumeTypeToK8sModel[volumeType];
  const volumeResourceName = getVolumeResourceName(volume);
  const watchVolumeResource = {
    isList: false,
    groupVersionKind: volumeResourceModel && modelToGroupVersionKind(volumeResourceModel),
    namespace: vm.metadata.namespace,
    name: volumeResourceName,
  };
  const [resource, loaded] = useK8sWatchResource<K8sResourceCommon>(watchVolumeResource);

  if (!volumeResourceModel || !volumeResourceName) {
    return {
      volumeResource: null,
      loaded: true,
      volumeResourceModel: null,
      volumeResourceName: null,
    };
  }
  const volumeResourceReference = resource?.metadata?.ownerReferences?.find((ownerRef) => {
    const vmOwnerRef = buildOwnerReference(vm);
    return compareOwnerReferences(ownerRef, vmOwnerRef);
  });
  return {
    volumeResource: volumeResourceReference ? resource : null,
    loaded,
    volumeResourceModel,
    volumeResourceName,
  };
};

export default useVolumeOwnedResource;
