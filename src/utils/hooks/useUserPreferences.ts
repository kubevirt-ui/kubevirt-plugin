import { VirtualMachinePreferenceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachinePreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { Selector } from '@openshift-console/dynamic-plugin-sdk';

import useKubevirtWatchResource from './useKubevirtWatchResource/useKubevirtWatchResource';
import { ALL_NAMESPACES_SESSION_KEY } from './constants';
import useListMulticlusterFilters from './useListMulticlusterFilters';

const useUserPreferences = (
  namespace: string,
  fieldSelector?: string,
  selector?: Selector,
  cluster?: string,
): [V1beta1VirtualMachinePreference[], boolean, Error] => {
  const clusterParam = useClusterParam();

  const multiclusterFilters = useListMulticlusterFilters();

  const [userPreferences, userPreferencesLoaded, userPreferencesError] = useKubevirtWatchResource<
    V1beta1VirtualMachinePreference[]
  >(
    {
      cluster: cluster || clusterParam,
      groupVersionKind: VirtualMachinePreferenceModelGroupVersionKind,
      isList: true,
      ...(namespace !== ALL_NAMESPACES_SESSION_KEY && { namespace: namespace }),
      fieldSelector,
      selector,
    },
    null,
    multiclusterFilters,
  );

  return [
    userPreferences,
    userPreferencesLoaded || !isEmpty(userPreferencesError),
    userPreferencesError,
  ];
};

export default useUserPreferences;
