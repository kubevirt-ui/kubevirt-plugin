import React, { FC, useState } from 'react';

import NewBadge from '@kubevirt-utils/components/badges/NewBadge/NewBadge';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant, Split, SplitItem, Switch } from '@patternfly/react-core';

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
      <Split>
        <SplitItem isFilled>
          {t('Auto-compute CPU and memory limits')} {newBadge && <NewBadge />}
        </SplitItem>
        <SplitItem>
          <Switch
            className={isLoading && 'kv-cursor--loading'}
            id="auto-compute-cpu-limits"
            isChecked={featureEnabled}
            isDisabled={!hcoLoaded}
            onChange={(_, checked: boolean) => onFeatureChange(checked)}
          />
        </SplitItem>
      </Split>
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
