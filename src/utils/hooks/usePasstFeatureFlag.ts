import { useMemo } from 'react';

import { HyperConvergedModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';
import { getAnnotations } from '@kubevirt-utils/resources/shared';
import {
  PASS_IP_STACK_MIGRATION_GATE,
  PASST_ANNOTATION,
  PASST_BINDING_NAME,
} from '@kubevirt-utils/resources/vm/utils/constants';
import { escapeJsonPointerToken, isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { Patch } from '@openshift-console/dynamic-plugin-sdk';

const usePasstFeatureFlag = (clusterOverride?: string) => {
  const clusterParam = useClusterParam();
  const cluster = clusterOverride || clusterParam;
  const { featureGates, hcConfig, hcLoaded } = useKubevirtHyperconvergeConfiguration(cluster);
  const [hyperConvergeConfiguration] = useHyperConvergeConfiguration(cluster);
  const isAdmin = useIsAdmin();

  const featureEnabled = useMemo(
    () => Boolean(hcConfig?.spec?.configuration?.network?.binding?.[PASST_BINDING_NAME]),
    [hcConfig],
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
    toggleFeature: (val: boolean) => {
      const patch: Patch[] = [
        ...(isEmpty(getAnnotations(hyperConvergeConfiguration))
          ? [{ op: 'add', path: '/metadata/annotations', value: {} }]
          : []),
        {
          op: 'replace',
          path: `/metadata/annotations/${escapeJsonPointerToken(PASST_ANNOTATION)}`,
          value: val.toString(),
        },
      ];

      return kubevirtK8sPatch({
        cluster,
        data: patch,
        model: HyperConvergedModel,
        resource: hyperConvergeConfiguration,
      });
    },
  };
};

export default usePasstFeatureFlag;
