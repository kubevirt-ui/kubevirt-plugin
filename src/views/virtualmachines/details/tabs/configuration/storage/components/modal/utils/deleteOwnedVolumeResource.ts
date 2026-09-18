import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { notifyDataVolumeDeleted } from '@kubevirt-utils/hooks/useUploadProgressToast/cancel/notifyDeletedUploadResources';
import { isK8sNotFoundError } from '@kubevirt-utils/resources/errorStatusChecks';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import {
  k8sDelete,
  type K8sModel,
  type K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';

export const deleteOwnedVolumeResource = async (
  volumeResource: K8sResourceCommon,
  volumeResourceModel: K8sModel | null,
): Promise<void> => {
  if (!volumeResourceModel) {
    return;
  }
  try {
    await k8sDelete({
      json: undefined,
      model: volumeResourceModel,
      requestInit: undefined,
      resource: volumeResource,
    });
  } catch (error) {
    if (!isK8sNotFoundError(error)) {
      throw error;
    }
  }

  if (volumeResourceModel === DataVolumeModel) {
    notifyDataVolumeDeleted(
      getName(volumeResource),
      getNamespace(volumeResource),
      getCluster(volumeResource),
    );
  }
};
