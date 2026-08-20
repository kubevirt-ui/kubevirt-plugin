import { useCallback, useMemo, useState } from 'react';

import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';

import { createOperator } from '../utils/createOperator/createOperator';
import {
  getNonInstalledFeatureManifests,
  packageManifestToOperatorItem,
} from '../utils/operatorResolution';
import {
  type CapabilityFeature,
  type UseInstallFeatureParams,
  type UseInstallFeatureReturn,
} from '../utils/types';
import useAwaitingOLM from './useAwaitingOLM';
import useInstallResources from './useInstallResources';

const useInstallFeature = ({
  detailsMap,
  features,
  filteredPackageManifests,
  operatorGroups,
  subscriptions,
}: UseInstallFeatureParams): UseInstallFeatureReturn => {
  const { t } = useKubevirtTranslation();
  const { addDangerToast, addSuccessToast } = useKubevirtToast();
  const cluster = useSettingsCluster();
  const [apiInstallingFeatures, setApiInstallingFeatures] = useState<Set<string>>(() => new Set());

  const getFeaturePackageNames = useCallback(
    (featureId: string) =>
      features
        .find((feature) => feature.id === featureId)
        ?.operators.map((opr) => opr.packageName) ?? [],
    [features],
  );

  const { awaitingOLMFeatures, markAwaitingOLM } = useAwaitingOLM(
    detailsMap,
    getFeaturePackageNames,
  );

  const { canPatchConsoleOperatorConfig, consoleOperatorConfig, namespaceNames } =
    useInstallResources();

  const installingFeatures = useMemo(
    () => new Set([...apiInstallingFeatures, ...awaitingOLMFeatures]),
    [apiInstallingFeatures, awaitingOLMFeatures],
  );

  const installFeature = useCallback(
    async (feature: CapabilityFeature) => {
      const featureId = feature.id;

      if (installingFeatures.has(featureId)) return;

      const manifestsToInstall = getNonInstalledFeatureManifests(
        feature,
        detailsMap,
        filteredPackageManifests,
      );

      if (isEmpty(manifestsToInstall)) {
        addDangerToast({
          title: t('No operators available to install for {{capability}}', {
            capability: feature.title,
          }),
        });
        return;
      }

      setApiInstallingFeatures((prev) => new Set(prev).add(featureId));
      const errors: Error[] = [];

      try {
        await Promise.all(
          manifestsToInstall.map((pkg) =>
            createOperator(
              packageManifestToOperatorItem(pkg),
              consoleOperatorConfig,
              canPatchConsoleOperatorConfig,
              namespaceNames,
              operatorGroups,
              subscriptions,
              cluster,
            ).catch((error: unknown) => {
              kubevirtConsole.error(`Failed to install operator ${getName(pkg)}:`, error);
              errors.push(error instanceof Error ? error : new Error(String(error)));
            }),
          ),
        );
      } finally {
        setApiInstallingFeatures((prev) => {
          const next = new Set(prev);
          next.delete(featureId);
          return next;
        });
      }

      if (isEmpty(errors) || errors.length < manifestsToInstall.length) {
        markAwaitingOLM(featureId);
      }

      if (isEmpty(errors)) {
        addSuccessToast({
          title: t('Installation started for {{capability}}', { capability: feature.title }),
        });
        return;
      }

      addDangerToast({
        title: t('Some operators failed to install for {{capability}} ({{errorCount}} error(s))', {
          capability: feature.title,
          errorCount: errors.length,
        }),
      });
    },
    [
      addDangerToast,
      addSuccessToast,
      canPatchConsoleOperatorConfig,
      cluster,
      consoleOperatorConfig,
      detailsMap,
      filteredPackageManifests,
      installingFeatures,
      markAwaitingOLM,
      namespaceNames,
      operatorGroups,
      subscriptions,
      t,
    ],
  );

  return { installFeature, installingFeatures };
};

export default useInstallFeature;
