/* eslint-disable */
import { useMemo } from 'react';
import { dump } from 'js-yaml';

import { HyperConvergedV1Beta1Model as HyperConvergedModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { escapeJsonPointerToken } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';

import {
  AUTOPILOT_MODE_ANNOTATION,
  HCO_AUTOPILOT_ANNOTATION,
} from '../../utils/autopilotConstants';
import { type AutopilotRegistryEntry } from '../../utils/autopilotRegistry';

type UseApplyRecommendationReturn = {
  currentYAML: string;
  onSubmit: () => Promise<void>;
};

const useApplyRecommendation = (
  managedCR: K8sResourceCommon | undefined,
  registryEntry: AutopilotRegistryEntry,
): UseApplyRecommendationReturn => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const [hco] = useHyperConvergeConfiguration();

  const currentYAML = useMemo(() => {
    if (!managedCR) {
      return `# ${t('{{name}} CR absent – not yet configured', { name: registryEntry.crModel.kind })}`;
    }
    const { managedFields: _, ...metadataWithoutManaged } = managedCR.metadata || {};
    return dump({ ...managedCR, metadata: metadataWithoutManaged }, { skipInvalid: true });
  }, [managedCR, registryEntry.crModel.kind, t]);

  const onSubmit = async () => {
    const ensureAutopilotEnabled = async () => {
      if (getAnnotation(hco, HCO_AUTOPILOT_ANNOTATION) === 'true' || !hco) return;
      await kubevirtK8sPatch({
        cluster,
        data: [
          {
            op: 'add',
            path: `/metadata/annotations/${escapeJsonPointerToken(HCO_AUTOPILOT_ANNOTATION)}`,
            value: 'true',
          },
        ],
        model: HyperConvergedModel,
        resource: hco,
      });
    };

    if (managedCR?.metadata?.name && getAnnotation(managedCR, AUTOPILOT_MODE_ANNOTATION)) {
      await kubevirtK8sPatch({
        cluster,
        data: [
          {
            op: 'remove',
            path: `/metadata/annotations/${escapeJsonPointerToken(AUTOPILOT_MODE_ANNOTATION)}`,
          },
        ],
        model: registryEntry.crModel,
        resource: managedCR,
      });
      await ensureAutopilotEnabled();
      return;
    }

    if (registryEntry.enableAnnotation && hco) {
      await ensureAutopilotEnabled();
      await kubevirtK8sPatch({
        cluster,
        data: [
          {
            op: 'add',
            path: `/metadata/annotations/${escapeJsonPointerToken(registryEntry.enableAnnotation)}`,
            value: 'true',
          },
        ],
        model: HyperConvergedModel,
        resource: hco,
      });
      return;
    }
  };

  return { currentYAML, onSubmit };
};

export default useApplyRecommendation;
