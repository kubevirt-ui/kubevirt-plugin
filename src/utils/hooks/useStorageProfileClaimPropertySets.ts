import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import StorageProfileModel from '@kubevirt-ui/kubevirt-api/console/models/StorageProfileModel';
import { ClaimPropertySets, StorageProfile } from '@kubevirt-utils/types/storage';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

export type UseStorageProfileClaimPropertySetsValue = {
  claimPropertySets: ClaimPropertySets;
  error: any;
  loaded: boolean;
};

const useStorageProfileClaimPropertySets = (
  storageClassName: string,
  cluster?: string,
): UseStorageProfileClaimPropertySetsValue => {
  const [storageProfile, loaded, error] = useK8sWatchData<StorageProfile>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(StorageProfileModel),
    isList: false,
    name: storageClassName,
  });

  const errorState = !storageClassName || !loaded || error;

  const { claimPropertySets } = storageProfile?.status || {};

  return { claimPropertySets: errorState ? null : claimPropertySets, error, loaded };
};

export default useStorageProfileClaimPropertySets;
