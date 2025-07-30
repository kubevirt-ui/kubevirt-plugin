import { VirtualMachinePreferenceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachinePreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { Selector } from '@openshift-console/dynamic-plugin-sdk';

import { ALL_NAMESPACES_SESSION_KEY } from './constants';

const useUserPreferences = (namespace: string, fieldSelector?: string, selector?: Selector) => {
  const cluster = useClusterParam();
  const [userPreferences, userPreferencesLoaded, userPreferencesError] = useK8sWatchData<
    V1beta1VirtualMachinePreference[]
  >({
    cluster,
    groupVersionKind: VirtualMachinePreferenceModelGroupVersionKind,
    isList: true,
    ...(namespace !== ALL_NAMESPACES_SESSION_KEY && { namespace: namespace }),
    fieldSelector,
    selector,
  });
  return [
    userPreferences,
    userPreferencesLoaded || !isEmpty(userPreferencesError),
    userPreferencesError,
  ];
};

export default useUserPreferences;
