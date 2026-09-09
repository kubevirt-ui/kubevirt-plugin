import { useCallback, useState } from 'react';

import { type V1Volume } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { getResourceKey, isResourceSavedByDefault } from '../utils/helpers';

type UseResourceSelectionReturn = {
  shouldSaveResource: (resource: K8sResourceCommon) => boolean;
  toggleResource: (resource: K8sResourceCommon) => void;
};

const useResourceSelection = (sharableVolumes: V1Volume[]): UseResourceSelectionReturn => {
  const [userOverrides, setUserOverrides] = useState<Record<string, boolean>>({});

  const shouldSaveResource = useCallback(
    (resource: K8sResourceCommon): boolean => {
      const key = getResourceKey(resource);
      if (key in userOverrides) return userOverrides[key];
      return isResourceSavedByDefault(resource, sharableVolumes);
    },
    [userOverrides, sharableVolumes],
  );

  const toggleResource = useCallback(
    (resource: K8sResourceCommon) => {
      const key = getResourceKey(resource);
      setUserOverrides((prev) => {
        const currentlySaved =
          key in prev ? prev[key] : isResourceSavedByDefault(resource, sharableVolumes);
        return { ...prev, [key]: !currentlySaved };
      });
    },
    [sharableVolumes],
  );

  return { shouldSaveResource, toggleResource };
};

export default useResourceSelection;
