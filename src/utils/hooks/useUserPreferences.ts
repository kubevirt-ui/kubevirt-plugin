import { VirtualMachinePreferenceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachinePreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { ALL_NAMESPACES_SESSION_KEY } from './constants';

const useUserPreferences = (namespace: string) =>
  useK8sWatchResource<V1beta1VirtualMachinePreference[]>({
    groupVersionKind: VirtualMachinePreferenceModelGroupVersionKind,
    isList: true,
    ...(namespace !== ALL_NAMESPACES_SESSION_KEY && { namespace: namespace }),
  });

export default useUserPreferences;
