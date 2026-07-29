import React, { FC, useCallback, useMemo } from 'react';

import { type TFunction } from 'i18next';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, Skeleton, Tooltip } from '@patternfly/react-core';

import { useCapabilitiesActions } from '../../context/useCapabilitiesActions';
import { useCapabilitiesData } from '../../context/useCapabilitiesData';
import { CapabilityInstallState } from '../../utils/types';
import { hasOperatorsInstalling } from '../CustomSelectionView/utils';

const getTooltipContent = (
  isAdmin: boolean,
  hasSelection: boolean,
  hasLoadErrors: boolean,
  t: TFunction,
): string | undefined => {
  if (!isAdmin) return t('You must be an administrator to install operators');
  if (hasLoadErrors) return t('Cannot install while operator data failed to load');
  if (!hasSelection) return t('Select capabilities to install');
  return undefined;
};

const InstallSelectedButton: FC = () => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const { detailsMap, features, getCapabilityInstallState, loadErrors, resourcesLoaded } =
    useCapabilitiesData();
  const {
    capabilitySelection,
    installFeature,
    installingFeatures,
    installResourcesLoaded,
    isInstalling,
  } = useCapabilitiesActions();

  const isLoaded = resourcesLoaded && installResourcesLoaded;

  const installableSelectedFeatures = useMemo(
    () =>
      features.filter(
        (feature) =>
          capabilitySelection.isSelected({ id: feature.id }) &&
          getCapabilityInstallState(feature) !== CapabilityInstallState.Installed &&
          !installingFeatures.has(feature.id) &&
          !hasOperatorsInstalling(feature, detailsMap),
      ),
    [capabilitySelection, detailsMap, features, getCapabilityInstallState, installingFeatures],
  );

  const handleInstall = useCallback(() => {
    installableSelectedFeatures.forEach((feature) => void installFeature(feature));
  }, [installableSelectedFeatures, installFeature]);

  if (!isLoaded) {
    return <Skeleton width="120px" />;
  }

  const hasSelection = !isEmpty(installableSelectedFeatures);
  const hasLoadErrors = !isEmpty(loadErrors);
  const isAnyInstalling = isInstalling || installingFeatures.size > 0;
  const isDisabled = !isAdmin || !hasSelection || isAnyInstalling || hasLoadErrors;

  const tooltipContent = getTooltipContent(isAdmin, hasSelection, hasLoadErrors, t);

  const button = (
    <Button
      isAriaDisabled={isDisabled}
      isLoading={isAnyInstalling}
      onClick={handleInstall}
      variant="primary"
    >
      {t('Install selected')}
    </Button>
  );

  return tooltipContent ? <Tooltip content={tooltipContent}>{button}</Tooltip> : button;
};

export default InstallSelectedButton;
