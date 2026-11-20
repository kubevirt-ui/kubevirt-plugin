import {
  ControllerRevisionModelGroupVersionKind,
  VirtualMachinePreferenceModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import type { IoK8sApiAppsV1ControllerRevision } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import type {
  V1beta1VirtualMachinePreference,
  V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { getPreferenceRevisionName } from '@kubevirt-utils/resources/instancetype/selectors';
import { getPreferenceModelFromMatcher } from '@kubevirt-utils/resources/preference/helper';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getPreferenceMatcher } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

/**
 * Resolves the preference applied to a VM.
 * Existing VMs use the preference snapshot bound in their ControllerRevision.
 * New drafts without a bound revision fall back to the live preference by name.
 * Lookup failures are returned as `error` with `loading` false; the live preference
 * is never substituted for a failed bound-snapshot lookup.
 */
const usePreference = (
  vm: V1VirtualMachine,
): [preference: V1beta1VirtualMachinePreference, loading: boolean, error: Error] => {
  const vmPreference = getPreferenceMatcher(vm);
  const revisionName = getPreferenceRevisionName(vm);

  const [controllerRevision, revisionLoaded, revisionError] =
    useK8sWatchData<IoK8sApiAppsV1ControllerRevision>(
      revisionName && {
        cluster: getCluster(vm),
        groupVersionKind: ControllerRevisionModelGroupVersionKind,
        name: revisionName,
        namespace: getNamespace(vm),
      },
    );

  const preferenceModel = getPreferenceModelFromMatcher(vmPreference);

  const [livePreference, liveLoaded, liveError] = useK8sWatchData<V1beta1VirtualMachinePreference>(
    !revisionName &&
      !isEmpty(vmPreference) && {
        cluster: getCluster(vm),
        groupVersionKind: modelToGroupVersionKind(preferenceModel),
        name: vmPreference?.name,
        namespace: preferenceModel === VirtualMachinePreferenceModel ? getNamespace(vm) : undefined,
      },
  );

  if (revisionName) {
    return [
      controllerRevision?.data as V1beta1VirtualMachinePreference,
      !revisionLoaded && isEmpty(revisionError),
      revisionError,
    ];
  }

  return [livePreference, !liveLoaded && isEmpty(liveError), liveError];
};

export default usePreference;
