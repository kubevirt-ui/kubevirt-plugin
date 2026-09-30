import { useMemo } from 'react';

import { K8S_OPS } from '@kubevirt-utils/constants/constants';
import useHyperConvergeConfiguration, {
  type HyperConverged,
} from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useKubevirtHyperconvergeConfiguration, {
  type KubevirtHyperconverged,
} from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';
import { getHyperConvergedModelFromResource } from '@kubevirt-utils/resources/hyperconverged/model';
import { getHyperconvergedConfiguration } from '@kubevirt-utils/resources/hyperconverged/selectors';
import { getAnnotations } from '@kubevirt-utils/resources/shared';
import {
  PASS_IP_STACK_MIGRATION_GATE,
  PASST_ANNOTATION,
  PASST_BINDING_FEATURE_GATE,
  PASST_BINDING_NAME,
} from '@kubevirt-utils/resources/vm/utils/constants';
import { escapeJsonPointerToken, isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { type Patch } from '@openshift-console/dynamic-plugin-sdk';

type UsePasstFeatureFlag = (clusterOverride?: string) => {
  canEdit: boolean;
  featureEnabled: boolean;
  isLegacyPasst: boolean;
  loading: boolean;
  toggleFeature: (val: boolean) => Promise<HyperConverged>;
};

export const isPasstNetworkBindingEnabled = (
  hyperConverged: HyperConverged | undefined,
  kubeVirtConfig: KubevirtHyperconverged | undefined,
  featureGates: string[] | undefined,
): boolean => {
  const passtAnnotation = getAnnotations(hyperConverged)?.[PASST_ANNOTATION];
  if (passtAnnotation !== undefined) {
    return passtAnnotation === 'true';
  }

  if (featureGates?.includes(PASST_BINDING_FEATURE_GATE)) {
    return true;
  }

  return Boolean(
    getHyperconvergedConfiguration(kubeVirtConfig)?.network?.binding?.[PASST_BINDING_NAME],
  );
};

const usePasstFeatureFlag: UsePasstFeatureFlag = (clusterOverride) => {
  const clusterParam = useClusterParam();
  const cluster = clusterOverride ?? clusterParam;
  const { featureGates, hcConfig, hcLoaded } = useKubevirtHyperconvergeConfiguration(cluster);
  const [hyperConvergeConfiguration] = useHyperConvergeConfiguration(cluster);
  const isAdmin = useIsAdmin();

  const featureEnabled = useMemo(
    () => isPasstNetworkBindingEnabled(hyperConvergeConfiguration, hcConfig, featureGates),
    [featureGates, hcConfig, hyperConvergeConfiguration],
  );

  const isLegacyPasst = useMemo(
    () => featureGates?.includes(PASS_IP_STACK_MIGRATION_GATE) ?? false,
    [featureGates],
  );

  return {
    canEdit: isAdmin,
    featureEnabled,
    isLegacyPasst,
    loading: !hcLoaded,
    toggleFeature: (val: boolean): Promise<HyperConverged> => {
      if (!hyperConvergeConfiguration) {
        return Promise.reject(new Error('HyperConverged configuration is not loaded'));
      }

      const annotations = getAnnotations(hyperConvergeConfiguration) ?? {};
      const hasAnnotations = !isEmpty(annotations);
      const hasPasstAnnotation = PASST_ANNOTATION in annotations;

      const patch: Patch[] = [
        ...(!hasAnnotations ? [{ op: K8S_OPS.ADD, path: '/metadata/annotations', value: {} }] : []),
        {
          op: hasPasstAnnotation ? K8S_OPS.REPLACE : K8S_OPS.ADD,
          path: `/metadata/annotations/${escapeJsonPointerToken(PASST_ANNOTATION)}`,
          value: val.toString(),
        },
      ];

      return kubevirtK8sPatch({
        cluster,
        data: patch,
        model: getHyperConvergedModelFromResource(hyperConvergeConfiguration),
        resource: hyperConvergeConfiguration,
      });
    },
  };
};

export default usePasstFeatureFlag;
