import React, { FC, useCallback } from 'react';

import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Skeleton } from '@patternfly/react-core';

import ExpandSection from '../../../../ExpandSection/ExpandSection';

import { MEMORY_OVERCOMMIT_END_VALUE, MEMORY_OVERCOMMIT_STARTING_VALUE } from './utils/const';

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
            path: `/spec/higherWorkloadDensity/memoryOvercommitPercentage`,
            value: checked ? MEMORY_OVERCOMMIT_END_VALUE : MEMORY_OVERCOMMIT_STARTING_VALUE,
          },
        ],
        model: HyperConvergedModel,
        resource: hyperConverge,
      });
    },
    [hyperConverge],
  );

  if (!hyperLoaded) return <Skeleton width={'300px'} />;

  const higherDensity = hyperConverge.spec?.higherWorkloadDensity?.memoryOvercommitPercentage;

  return (
    <ExpandSection toggleText={t('Memory density')}>
      <SectionWithSwitch
        helpTextIconContent={t('Configures the VM workloads to use swap for higher density')}
        id="memory-density-feature"
        isDisabled={!hyperLoaded || !isAdmin}
        newBadge={newBadge}
        switchIsOn={Boolean(higherDensity > MEMORY_OVERCOMMIT_STARTING_VALUE)}
        title={t('Enable memory density')}
        turnOnSwitch={onChange}
      />
    </ExpandSection>
  );
};

export default MemoryDensity;
