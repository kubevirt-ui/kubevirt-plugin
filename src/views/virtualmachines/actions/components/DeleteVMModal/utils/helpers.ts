import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { compareOwnerReferences } from '@kubevirt-utils/resources/shared';
import { K8sModel, k8sPatch, OwnerReference } from '@openshift-console/dynamic-plugin-sdk';

export const updateVolumeResources = (
  resources: IoK8sApiCoreV1PersistentVolumeClaim[] | V1beta1DataVolume[],
  vmOwnerRef: OwnerReference,
  model: K8sModel,
) => {
  return (resources || []).map((resource) => {
    const resourceFilteredOwnerReference = resource?.metadata?.ownerReferences?.filter(
      (resourceRef) => !compareOwnerReferences(resourceRef, vmOwnerRef),
    );
    return k8sPatch({
      model: model,
      resource,
      data: [
        {
          op: 'replace',
          path: '/metadata/ownerReferences',
          value: resourceFilteredOwnerReference,
        },
      ],
    });
  });
};
