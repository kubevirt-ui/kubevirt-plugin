import { useMemo } from 'react';

import { type V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useClusterPreferences from '@kubevirt-utils/hooks/useClusterPreferences';
import { convertResourceArrayToMap, type ResourceMap } from '@kubevirt-utils/resources/shared';

type UseClusterPreferencesByName = (
  cluster?: string,
) => ResourceMap<V1beta1VirtualMachineClusterPreference>;

const useClusterPreferencesByName: UseClusterPreferencesByName = (cluster) => {
  const [clusterPreferences] = useClusterPreferences(undefined, undefined, cluster);

  return useMemo(() => convertResourceArrayToMap(clusterPreferences), [clusterPreferences]);
};

export default useClusterPreferencesByName;
