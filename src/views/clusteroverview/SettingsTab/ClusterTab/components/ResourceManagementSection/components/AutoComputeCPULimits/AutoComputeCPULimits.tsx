import React, { FC, useState } from 'react';

import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

import { AUTO_RESOURCE_LIMITS_FEATURE_GATE } from './utils/constants';
import { updateAutoResourceLimitsFeatureGate } from './utils/utils';

type AutoComputeCPULimitsProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: Error];
  newBadge?: boolean;
};
const AutoComputeCPULimits: FC<AutoComputeCPULimitsProps> = ({
  hyperConvergeConfiguration,
  newBadge,
}) => {
  const { t } = useKubevirtTranslation();
  const [hco, hcoLoaded] = hyperConvergeConfiguration;
  const featureGates = hco?.spec?.featureGates;

  const [featureEnabled, setFeatureEnabled] = useState<boolean>(
    Boolean(featureGates?.[AUTO_RESOURCE_LIMITS_FEATURE_GATE]),
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  const onFeatureChange = (switchOn: boolean) => {
    setIsLoading(true);
    updateAutoResourceLimitsFeatureGate(hco, switchOn)
      .then(() => setFeatureEnabled(switchOn))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <SectionWithSwitch
        dataTestID="auto-compute"
        isDisabled={!hcoLoaded}
        isLoading={isLoading}
        newBadge={newBadge}
        switchIsOn={featureEnabled}
        title={t('Auto-compute CPU and memory limits')}
        turnOnSwitch={onFeatureChange}
      />
      {error && (
        <Alert
          className="autocompute-cpu-limits__error-alert"
          isInline
          title={t('Error')}
          variant={AlertVariant.danger}
        >
          {error}
        </Alert>
      )}
    </>
  );
};

export default AutoComputeCPULimits;
