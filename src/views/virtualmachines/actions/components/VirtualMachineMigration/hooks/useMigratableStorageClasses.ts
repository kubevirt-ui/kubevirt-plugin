import { V1beta1StorageSpecAccessModesEnum } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { StorageProfileModelGroupVersionKind } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const useMigratableStorageClasses = (): string[] => {
  const [storageProfiles] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: StorageProfileModelGroupVersionKind,
    isList: true,
  });

  const allowedStorageProfilesNames = storageProfiles?.reduce((acc, storageProfile: any) => {
    if (
      storageProfile?.status?.claimPropertySets?.some((claimProperty) =>
        claimProperty?.accessModes?.includes(V1beta1StorageSpecAccessModesEnum.ReadWriteMany),
      )
    )
      acc.push(getName(storageProfile));

    return acc;
  }, []);

  return allowedStorageProfilesNames;
};

export default useMigratableStorageClasses;
