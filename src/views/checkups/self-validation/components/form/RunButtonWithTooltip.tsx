import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';

import RunningCheckupWarningDescription from '../actions/RunningCheckupWarningDescription';

import { RunButtonWithTooltipProps } from './types';

const RunButtonWithTooltip: FC<RunButtonWithTooltipProps> = ({
  configMapInfo,
  eulaPendingConfirmation,
  isSubmitDisabled,
  isSubmitting,
  onClick,
  showRunningCheckupTooltip,
  showTooltip,
}) => {
  const { t } = useKubevirtTranslation();

  const runButton = (
    <Button
      isAriaDisabled={isSubmitDisabled}
      isLoading={isSubmitting}
      onClick={isSubmitDisabled ? undefined : onClick}
      variant={ButtonVariant.primary}
    >
      {t('Run')}
    </Button>
  );

  if (!showTooltip) {
    return runButton;
  }

  return (
    <Tooltip
      content={
        eulaPendingConfirmation
          ? t('To run the checkup, accept the Windows End User License Agreement (EULA).')
          : showRunningCheckupTooltip &&
            configMapInfo && (
              <RunningCheckupWarningDescription
                configMapCluster={configMapInfo.cluster}
                configMapName={configMapInfo.name}
                configMapNamespace={configMapInfo.namespace}
              />
            )
      }
    >
      {runButton}
    </Tooltip>
  );
};

export default RunButtonWithTooltip;
