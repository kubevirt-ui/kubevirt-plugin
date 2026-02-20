import { VirtualMachineClusterInstancetypeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineClusterPreferenceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineInstancetypeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachinePreferenceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { isAAQEnabled } from '@kubevirt-utils/resources/hyperconverged/utils';
import {
  K8sVerb,
  SetFeatureFlag,
  useAccessReview,
  useActiveNamespace,
} from '@openshift-console/dynamic-plugin-sdk';

import {
  FLAG_KUBEVIRT_INSTANCETYPES,
  FLAG_KUBEVIRT_PREFERENCES,
  FLAG_KUBEVIRT_QUOTAS,
} from './consts';

const useEnableKubevirtMenuFlags = (setFeatureFlag: SetFeatureFlag) => {
  const [namespace] = useActiveNamespace();

  const [canShowClusterInstancetypes] = useAccessReview({
    group: VirtualMachineClusterInstancetypeModel.apiGroup,
    resource: VirtualMachineClusterInstancetypeModel.plural,
    verb: 'list' as K8sVerb,
  });

  const [canShowInstancetypes] = useAccessReview({
    group: VirtualMachineInstancetypeModel.apiGroup,
    namespace,
    resource: VirtualMachineInstancetypeModel.plural,
    verb: 'list' as K8sVerb,
  });
  const [canShowClusterPreferences] = useAccessReview({
    group: VirtualMachineClusterPreferenceModel.apiGroup,
    namespace,
    resource: VirtualMachineClusterPreferenceModel.plural,
    verb: 'list' as K8sVerb,
  });

  const [canShowPreferences] = useAccessReview({
    group: VirtualMachinePreferenceModel.apiGroup,
    namespace,
    resource: VirtualMachinePreferenceModel.plural,
    verb: 'list' as K8sVerb,
  });

  const [hyperConverge, hyperLoaded] = useHyperConvergeConfiguration();
  const canShowQuotas = hyperLoaded && isAAQEnabled(hyperConverge);

  setFeatureFlag(FLAG_KUBEVIRT_PREFERENCES, canShowPreferences || canShowClusterPreferences);
  setFeatureFlag(FLAG_KUBEVIRT_INSTANCETYPES, canShowInstancetypes || canShowClusterInstancetypes);
  setFeatureFlag(FLAG_KUBEVIRT_QUOTAS, canShowQuotas);
};

export default useEnableKubevirtMenuFlags;
