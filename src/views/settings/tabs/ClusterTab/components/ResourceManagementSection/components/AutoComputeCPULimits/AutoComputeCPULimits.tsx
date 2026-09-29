import { type FC, useEffect, useState } from 'react';

import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { type HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isFeatureGateEnabled } from '@kubevirt-utils/resources/hyperconverged/selectors';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';

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
  const cluster = useSettingsCluster();
  const [hco, hcoLoaded] = hyperConvergeConfiguration;
  const featureEnabled = isFeatureGateEnabled(hco, AUTO_RESOURCE_LIMITS_FEATURE_GATE);

  const [isFeatureEnabled, setIsFeatureEnabled] = useState<boolean>(featureEnabled);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    setError(undefined);
    setIsFeatureEnabled(hcoLoaded ? featureEnabled : false);
  }, [cluster, featureEnabled, hcoLoaded]);

  const onFeatureChange = (switchOn: boolean): void => {
    setError(undefined);
    setIsLoading(true);
    updateAutoResourceLimitsFeatureGate(hco, switchOn, cluster)
      .then(() => setIsFeatureEnabled(switchOn))
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
        switchIsOn={isFeatureEnabled}
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
