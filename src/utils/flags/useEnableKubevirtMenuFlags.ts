import VirtualMachineClusterInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterInstancetypeModel';
import VirtualMachineClusterPreferenceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterPreferenceModel';
import { K8sVerb, SetFeatureFlag, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';

import { FLAG_KUBEVIRT_INSTANCETYPES, FLAG_KUBEVIRT_PREFERENCES } from './consts';

const useEnableKubevirtMenuFlags = (setFeatureFlag: SetFeatureFlag) => {
  const [canShowInstancetypes] = useAccessReview({
    group: VirtualMachineClusterInstancetypeModel.apiGroup,
    resource: VirtualMachineClusterInstancetypeModel.plural,
    verb: 'list' as K8sVerb,
  });

  const [canShowPreferences] = useAccessReview({
    group: VirtualMachineClusterPreferenceModel.apiGroup,
    resource: VirtualMachineClusterPreferenceModel.plural,
    verb: 'list' as K8sVerb,
  });

  setFeatureFlag(FLAG_KUBEVIRT_PREFERENCES, canShowPreferences);
  setFeatureFlag(FLAG_KUBEVIRT_INSTANCETYPES, canShowInstancetypes);
};

export default useEnableKubevirtMenuFlags;
