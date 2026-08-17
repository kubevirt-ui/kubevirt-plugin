import { V1KubeVirtConfiguration } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DEFAULT_OPERATOR_NAMESPACE } from '@kubevirt-utils/utils/utils';
import {
  K8sResourceCommon,
  K8sVerb,
  useAccessReview,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

import { KUBEVIRT_HC_GROUP_VERSION_KIND, KUBEVIRT_HC_NAME } from './constants';

export type KubevirtHyperconverged = K8sResourceCommon & {
  spec: {
    configuration: V1KubeVirtConfiguration;
  };
};

const useKubevirtHyperconvergeConfiguration = (): [
  hcConfig: KubevirtHyperconverged,
  configLoaded: boolean,
  configError: any,
] => {
  // Non-admins often have `get`/`list` on the KubeVirt CR but not `watch`, which
  // useK8sWatchResource needs to open a live connection.
  const [canGetHC, canGetHCLoading] = useAccessReview({
    group: KUBEVIRT_HC_GROUP_VERSION_KIND.group,
    name: KUBEVIRT_HC_NAME,
    namespace: DEFAULT_OPERATOR_NAMESPACE,
    resource: 'kubevirts',
    verb: 'watch' as K8sVerb,
  });

  const [kubevirtHCConfig, configLoaded, configError] = useK8sWatchResource<KubevirtHyperconverged>(
    canGetHC && {
      groupVersionKind: KUBEVIRT_HC_GROUP_VERSION_KIND,
      name: KUBEVIRT_HC_NAME,
      namespace: DEFAULT_OPERATOR_NAMESPACE,
    },
  );

  if (canGetHCLoading) {
    return [undefined, false, null];
  }

  if (!canGetHC) {
    return [undefined, true, null];
  }

  return [kubevirtHCConfig, configLoaded, configError];
};

export default useKubevirtHyperconvergeConfiguration;
