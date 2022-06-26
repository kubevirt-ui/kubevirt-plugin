import * as React from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import StorageProfileModel from '@kubevirt-ui/kubevirt-api/console/models/StorageProfileModel';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { StorageProfile } from '../utils/constants';

type UseStorageProfileClaimPropertySetsValue = {
  claimPropertySets: {
    accessModes: string[];
    volumeMode?: string;
  }[];
  loaded: boolean;
  error: any;
};

const useStorageProfileClaimPropertySets = (
  storageClassName: string,
): UseStorageProfileClaimPropertySetsValue => {
  const watchStorageProfileResource = React.useMemo(
    () => ({
      groupVersionKind: modelToGroupVersionKind(StorageProfileModel),
      isList: false,
      name: storageClassName,
    }),
    [storageClassName],
  );

  const [storageProfile, loaded, error] = useK8sWatchResource<StorageProfile>(
    watchStorageProfileResource,
  );
  const { claimPropertySets } = storageProfile?.status || {};

  return { claimPropertySets, loaded, error };
};

export default useStorageProfileClaimPropertySets;
