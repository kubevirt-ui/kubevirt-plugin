import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import StorageProfileModel from '@kubevirt-ui/kubevirt-api/console/models/StorageProfileModel';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { StorageProfile } from '../utils/constants';

type UseStorageProfileClaimPropertySetsValue = {
  claimPropertySets: {
    accessModes: string[];
    volumeMode?: string;
  }[];
  error: any;
  loaded: boolean;
};

const useStorageProfileClaimPropertySets = (
  storageClassName: string,
): UseStorageProfileClaimPropertySetsValue => {
  const [storageProfile, loaded, error] = useK8sWatchResource<StorageProfile>({
    groupVersionKind: modelToGroupVersionKind(StorageProfileModel),
    isList: false,
    name: storageClassName,
  });

  const errorState = !storageClassName || !loaded || error;

  const { claimPropertySets } = storageProfile?.status || {};

  return { claimPropertySets: errorState ? null : claimPropertySets, error, loaded };
};

export default useStorageProfileClaimPropertySets;
