import { VirtualMachinePreferenceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachinePreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Selector, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { ALL_NAMESPACES_SESSION_KEY } from './constants';

const useUserPreferences = (namespace: string, fieldSelector?: string, selector?: Selector) => {
  const [userPreferences, userPreferencesLoaded, userPreferencesError] = useK8sWatchResource<
    V1beta1VirtualMachinePreference[]
  >({
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
