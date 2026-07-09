import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import { createOperator } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/hooks/useCreateOperator/utils/createOperator';
import { InstallState } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/types';

import { OLM_PROCESSING_DELAY_MS } from '../utils/constants';
import { UseInstallBundleParams, UseInstallBundleReturn } from '../utils/types';
import { getNonInstalledBundleManifests, packageManifestToOperatorItem } from '../utils/utils';
import useInstallResources from './useInstallResources';

const useInstallBundle = ({
  detailsMap,
  features,
  filteredPackageManifests,
  operatorGroups,
  subscriptions,
}: UseInstallBundleParams): UseInstallBundleReturn => {
  const { t } = useKubevirtTranslation();
  const { addDangerToast, addSuccessToast } = useKubevirtToast();
  const cluster = useSettingsCluster();
  const [isInstalling, setIsInstalling] = useState(false);
  const isInstallingRef = useRef(false);
  const [isAwaitingOLM, setIsAwaitingOLM] = useState(false);

  const {
    canPatchConsoleOperatorConfig,
    consoleOperatorConfig,
    installResourcesLoaded,
    namespaceNames,
  } = useInstallResources();

  const isBundleInstallInProgress = useMemo(
    () =>
      features.some((feature) =>
        feature.operators.some(
          ({ packageName }) => detailsMap[packageName]?.installState === InstallState.INSTALLING,
        ),
      ),
    [detailsMap, features],
  );

  useEffect(() => {
    if (isAwaitingOLM && isBundleInstallInProgress) {
      setIsAwaitingOLM(false);
    }
  }, [isAwaitingOLM, isBundleInstallInProgress]);

  useEffect(() => {
    if (!isAwaitingOLM) return undefined;
    const timer = setTimeout(() => setIsAwaitingOLM(false), OLM_PROCESSING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isAwaitingOLM]);

  const installBundle = useCallback(async () => {
    if (isInstallingRef.current) return;

    const manifestsToInstall = getNonInstalledBundleManifests(
      features,
      detailsMap,
      filteredPackageManifests,
    );

    if (isEmpty(manifestsToInstall)) {
      addDangerToast({
        title: t('No operators available to install. OperatorHub catalog may not be configured.'),
      });
      return;
    }

    const updateInstallingState = (installing: boolean) => {
      setIsInstalling(installing);
      isInstallingRef.current = installing;
    };

    updateInstallingState(true);
    const errors: Error[] = [];

    try {
      await Promise.allSettled(
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
      updateInstallingState(false);
    }

    if (isEmpty(errors)) {
      addSuccessToast({ title: t('Bundle installation started successfully') });
      setIsAwaitingOLM(true);
      return;
    }

    addDangerToast({
      title: t('Some operators failed to install ({{errorCount}} error(s))', {
        errorCount: errors.length,
      }),
    });
  }, [
    addDangerToast,
    addSuccessToast,
    canPatchConsoleOperatorConfig,
    cluster,
    consoleOperatorConfig,
    detailsMap,
    features,
    filteredPackageManifests,
    namespaceNames,
    operatorGroups,
    subscriptions,
    t,
  ]);

  return { installBundle, installResourcesLoaded, isInstalling: isInstalling || isAwaitingOLM };
};

export default useInstallBundle;
