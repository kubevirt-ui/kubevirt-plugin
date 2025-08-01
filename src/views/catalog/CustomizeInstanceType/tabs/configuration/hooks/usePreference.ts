import VirtualMachinePreferenceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachinePreferenceModel';
import {
  V1beta1VirtualMachinePreference,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { getPreferenceModelFromMatcher } from '@kubevirt-utils/resources/preference/helper';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getPreferenceMatcher } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

const usePreference = (
  vm: V1VirtualMachine,
): [preference: V1beta1VirtualMachinePreference, loading: boolean] => {
  const vmPreference = getPreferenceMatcher(vm);

  const [preference, preferenceLoaded, preferenceError] =
    useK8sWatchData<V1beta1VirtualMachinePreference>({
      cluster: getCluster(vm),
      groupVersionKind: modelToGroupVersionKind(getPreferenceModelFromMatcher(vmPreference)),
      name: vmPreference?.name,
      namespace: vmPreference.kind === VirtualMachinePreferenceModel.kind ? getNamespace(vm) : null,
    });

  const preferenceLoading = !preferenceLoaded && isEmpty(preferenceError);

  return [preference, preferenceLoading];
};

export default usePreference;
