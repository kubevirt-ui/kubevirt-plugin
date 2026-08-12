import React, { type FC, useCallback, useMemo } from 'react';
import { type TFunction } from 'i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, Skeleton, Tooltip } from '@patternfly/react-core';

import { useCapabilitiesActions } from '../../context/useCapabilitiesActions';
import { useCapabilitiesData } from '../../context/useCapabilitiesData';
import { CapabilityInstallState } from '../../utils/types';
import { hasOperatorsInstalling } from '../CustomSelectionView/utils';

const getTooltipContent = (
  hasSelection: boolean,
  hasLoadErrors: boolean,
  t: TFunction,
): string | undefined => {
  if (hasLoadErrors) return t('Cannot install while operator data failed to load');
  if (!hasSelection) return t('Select capabilities to install');
  return undefined;
};

const InstallSelectedButton: FC = () => {
  const { t } = useKubevirtTranslation();
  const { autopilotFeatures, detailsMap, getCapabilityInstallState, loadErrors, resourcesLoaded } =
    useCapabilitiesData();
  const { capabilitySelection, installFeature, installingFeatures } = useCapabilitiesActions();

  const installableSelectedFeatures = useMemo(
    () =>
      autopilotFeatures.filter(
        (feature) =>
          capabilitySelection.isSelected({ id: feature.id }) &&
          getCapabilityInstallState(feature) !== CapabilityInstallState.Installed &&
          !installingFeatures.has(feature.id) &&
          !hasOperatorsInstalling(feature, detailsMap),
      ),
    [
      autopilotFeatures,
      capabilitySelection,
      detailsMap,
      getCapabilityInstallState,
      installingFeatures,
    ],
  );

  const handleInstall = useCallback(() => {
    for (const feature of installableSelectedFeatures) void installFeature(feature);
  }, [installableSelectedFeatures, installFeature]);

  if (!resourcesLoaded) {
    return <Skeleton width="120px" />;
  }

  const hasSelection = !isEmpty(installableSelectedFeatures);
  const hasLoadErrors = !isEmpty(loadErrors);
  const isAnyInstalling = installingFeatures.size > 0;
  const isDisabled = !hasSelection || isAnyInstalling || hasLoadErrors;

  const tooltipContent = getTooltipContent(hasSelection, hasLoadErrors, t);

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
