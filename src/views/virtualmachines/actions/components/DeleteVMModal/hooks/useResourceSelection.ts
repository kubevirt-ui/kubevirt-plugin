import { useCallback, useState } from 'react';

import { V1Volume } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { getResourceKey, isResourceSavedByDefault } from '../utils/helpers';

const useResourceSelection = (sharableVolumes: V1Volume[]) => {
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
