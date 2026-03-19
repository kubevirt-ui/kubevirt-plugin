import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getName } from '@kubevirt-utils/resources/shared';
import { StorageProfile } from '@kubevirt-utils/types/storage';

export const getReadyStorageClasses = (
  storageClasses: IoK8sApiStorageV1StorageClass[],
  storageProfiles: StorageProfile[],
): IoK8sApiStorageV1StorageClass[] => {
  const scNamesWithClaimPropertySets = new Set(
    storageProfiles?.filter((sp) => sp?.status?.claimPropertySets?.length > 0)?.map(getName),
  );

  return storageClasses?.filter((sc) => scNamesWithClaimPropertySets.has(getName(sc)));
};
