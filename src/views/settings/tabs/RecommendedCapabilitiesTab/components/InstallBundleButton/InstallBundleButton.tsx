import React, { FC } from 'react';

import { type TFunction } from 'i18next';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, Skeleton, Tooltip } from '@patternfly/react-core';
import { InstallState } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/types';

import { useCapabilitiesActions } from '../../context/useCapabilitiesActions';
import { useCapabilitiesData } from '../../context/useCapabilitiesData';
import { countInstalledCapabilities, getBundleFeatures } from '../../utils/utils';

const getInstallBundleTooltipContent = (
  isAdmin: boolean,
  allBundleCapabilitiesInstalled: boolean,
  hasLoadErrors: boolean,
  t: TFunction,
): string | undefined => {
  if (!isAdmin) return t('You must be an administrator to install operators');
  if (hasLoadErrors) return t('Cannot install while operator data failed to load');
  if (allBundleCapabilitiesInstalled) return t('All bundle capabilities are already installed');
  return undefined;
};

const InstallBundleButton: FC = () => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const { detailsMap, features, loadErrors, resourcesLoaded } = useCapabilitiesData();
  const { installBundle, installResourcesLoaded, isInstalling } = useCapabilitiesActions();

  const isLoaded = resourcesLoaded && installResourcesLoaded;

  if (!isLoaded) {
    return <Skeleton width="120px" />;
  }

  const bundleFeatures = getBundleFeatures(features);
  const allBundleCapabilitiesInstalled =
    countInstalledCapabilities(bundleFeatures, detailsMap) === bundleFeatures.length;

  const isBundleInstallInProgress = bundleFeatures.some((feature) =>
    feature.operators.some(
      ({ packageName }) => detailsMap[packageName]?.installState === InstallState.INSTALLING,
    ),
  );

  const hasLoadErrors = !isEmpty(loadErrors);

  const isDisabled =
    !isAdmin ||
    isInstalling ||
    isBundleInstallInProgress ||
    allBundleCapabilitiesInstalled ||
    hasLoadErrors;

  const tooltipContent = getInstallBundleTooltipContent(
    isAdmin,
    allBundleCapabilitiesInstalled,
    hasLoadErrors,
    t,
  );

  const button = (
    <Button
      isDisabled={isDisabled}
      isLoading={isInstalling || isBundleInstallInProgress}
      onClick={installBundle}
      variant="primary"
    >
      {t('Install bundle')}
    </Button>
  );

  return tooltipContent ? <Tooltip content={tooltipContent}>{button}</Tooltip> : button;
};

export default InstallBundleButton;
