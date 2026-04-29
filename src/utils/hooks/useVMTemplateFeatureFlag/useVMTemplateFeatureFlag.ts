import { useMemo } from 'react';

import { HyperConvergedModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { K8S_OPS } from '@kubevirt-utils/constants/constants';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';
import { getAnnotations } from '@kubevirt-utils/resources/shared';
import { escapeJsonPointerToken, isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { Patch } from '@openshift-console/dynamic-plugin-sdk';

import {
  ADD_TEMPLATE_FEATURE_GATE_PATCH,
  KUBEVIRT_JSONPATCH_ANNOTATION,
  TEMPLATE_FEATURE_GATE,
} from './constants';
import { isTemplatePatch, parseJsonPatchAnnotation } from './utils';

const useVMTemplateFeatureFlag = (clusterOverride?: string) => {
  const clusterParam = useClusterParam();
  const cluster = clusterOverride || clusterParam;
  const { featureGates, hcLoaded } = useKubevirtHyperconvergeConfiguration(cluster);
  const [hyperConvergeConfiguration, hcConfigLoaded] = useHyperConvergeConfiguration(cluster);
  const isAdmin = useIsAdmin();

  const featureEnabled = useMemo(
    () => featureGates?.includes(TEMPLATE_FEATURE_GATE) ?? false,
    [featureGates],
  );

  return {
    canEdit: isAdmin,
    featureEnabled,
    loading: !hcLoaded || !hcConfigLoaded,
    toggleFeature: (isChecked: boolean) => {
      if (!hyperConvergeConfiguration) {
        return Promise.reject(new Error('HyperConverged configuration is not loaded'));
      }

      const annotations = getAnnotations(hyperConvergeConfiguration) || {};
      const currentValue = annotations[KUBEVIRT_JSONPATCH_ANNOTATION];
      let operations = parseJsonPatchAnnotation(currentValue);

      if (isChecked) {
        if (!operations.some(isTemplatePatch)) {
          operations.push(ADD_TEMPLATE_FEATURE_GATE_PATCH);
        }
      } else {
        operations = operations.filter((p) => !isTemplatePatch(p));
      }

      const hasAnnotations = !isEmpty(annotations);

      const patch: Patch[] = [
        ...(!hasAnnotations ? [{ op: K8S_OPS.ADD, path: '/metadata/annotations', value: {} }] : []),
        {
          op:
            hasAnnotations && KUBEVIRT_JSONPATCH_ANNOTATION in annotations
              ? K8S_OPS.REPLACE
              : K8S_OPS.ADD,
          path: `/metadata/annotations/${escapeJsonPointerToken(KUBEVIRT_JSONPATCH_ANNOTATION)}`,
          value: JSON.stringify(operations),
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

export default useVMTemplateFeatureFlag;
