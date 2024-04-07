import React, { FC, useCallback } from 'react';

import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Skeleton } from '@patternfly/react-core';

import ExpandSection from '../../../../ExpandSection/ExpandSection';

type MemoryDensityProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: any];
  newBadge: boolean;
};

const MemoryDensity: FC<MemoryDensityProps> = ({ hyperConvergeConfiguration, newBadge }) => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const [hyperConverge, hyperLoaded] = hyperConvergeConfiguration;

  const onChange = useCallback(
    (checked: boolean) => {
      k8sPatch({
        data: [
          {
            op: 'replace',
            path: `/spec/featureGates/enableHigherDensityWithSwap`,
            value: checked,
          },
          {
            op: 'replace',
            path: `/spec/higherWorkloadDensity/memoryOvercommitPercentage`,
            value: checked ? 150 : 100,
          },
        ],
        model: HyperConvergedModel,
        resource: hyperConverge,
      });
    },
    [hyperConverge],
  );

  if (!hyperLoaded) return <Skeleton width={'300px'} />;

  const higherDensity = hyperConverge.spec?.featureGates?.enableHigherDensityWithSwap;

  return (
    <ExpandSection toggleText={t('Memory density')}>
      <SectionWithSwitch
        helpTextIconContent={t('Configures the VM workloads to use swap for higher density')}
        id="memory-density-feature"
        isDisabled={!hyperLoaded || !isAdmin || !isEmpty(higherDensity)}
        newBadge={newBadge}
        switchIsOn={Boolean(higherDensity)}
        title={t('Enable memory density')}
        turnOnSwitch={onChange}
      />
    </ExpandSection>
  );
};

export default MemoryDensity;
