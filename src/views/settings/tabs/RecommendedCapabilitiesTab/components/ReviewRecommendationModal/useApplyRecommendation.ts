import { useCallback, useMemo, useState } from 'react';
import { dump } from 'js-yaml';

import { HyperConvergedV1Beta1Model as HyperConvergedModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { escapeJsonPointerToken, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { type K8sModel, type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';

import { AUTOPILOT_MODE_ANNOTATION } from '../../utils/autopilotConstants';
import { type AutopilotRegistryEntry } from '../../utils/autopilotRegistry';
import { buildModelFromRegistryEntry } from '../../utils/autopilotUtils';

type PatchAction = {
  data: Array<{ op: string; path: string; value?: string }>;
  model: K8sModel;
  resource: K8sResourceCommon;
};

const resolvePatchAction = (
  managedCR: K8sResourceCommon | undefined,
  registryEntry: AutopilotRegistryEntry,
  hco: K8sResourceCommon | undefined,
): PatchAction | null => {
  if (managedCR?.metadata?.name) {
    return {
      data: [
        {
          op: 'remove',
          path: `/metadata/annotations/${escapeJsonPointerToken(AUTOPILOT_MODE_ANNOTATION)}`,
        },
      ],
      model: buildModelFromRegistryEntry(registryEntry),
      resource: managedCR,
    };
  }

  if (registryEntry.enableAnnotation && hco) {
    return {
      data: [
        {
          op: 'add',
          path: `/metadata/annotations/${escapeJsonPointerToken(registryEntry.enableAnnotation)}`,
          value: 'true',
        },
      ],
      model: HyperConvergedModel,
      resource: hco,
    };
  }

  return null;
};

type UseApplyRecommendationReturn = {
  currentYAML: string;
  handleSubmit: () => Promise<void>;
  isSubmitting: boolean;
  submitError: Error | undefined;
};

const useApplyRecommendation = (
  managedCR: K8sResourceCommon | undefined,
  registryEntry: AutopilotRegistryEntry,
  onClose: () => void,
): UseApplyRecommendationReturn => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const [hco] = useHyperConvergeConfiguration();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Error>();

  const currentYAML = useMemo(() => {
    if (!managedCR) {
      return `# ${t('{{name}} CR absent – not yet configured', { name: registryEntry.crGVK.kind })}`;
    }
    const { managedFields: _, ...metadataWithoutManaged } = managedCR.metadata || {};
    return dump({ ...managedCR, metadata: metadataWithoutManaged }, { skipInvalid: true });
  }, [managedCR, registryEntry.crGVK.kind, t]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(undefined);

    try {
      const action = resolvePatchAction(managedCR, registryEntry, hco);

      if (!action) {
        kubevirtConsole.warn('[ReviewRecommendationModal] No action taken', {
          enableAnnotation: registryEntry.enableAnnotation,
          hasManagedCR: !!managedCR,
          hcoLoaded: !!hco,
        });
        onClose();
        return;
      }

      await kubevirtK8sPatch({ cluster, ...action });
      onClose();
    } catch (error) {
      setSubmitError(error as Error);
      kubevirtConsole.error('[ReviewRecommendationModal] Submit failed', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [cluster, hco, managedCR, onClose, registryEntry]);

  return { currentYAML, handleSubmit, isSubmitting, submitError };
};

export default useApplyRecommendation;
