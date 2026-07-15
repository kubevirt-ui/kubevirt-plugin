import React, { FC, useState } from 'react';

import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import NewBadge from '@kubevirt-utils/components/badges/NewBadge/NewBadge';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Skeleton, Stack, StackItem } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import { getGeneralSettingsLabels } from '../consts/consts';
import GeneralSettingsError from '../shared/GeneralSettingsError';

import ActiveRatio from './components/ActiveRatio';
import MemoryRequestRatioHelpContent from './components/MemoryRequestRatioHelpContent';
import MemoryRequestRatioInput from './components/MemoryRequestRatioInput';
import useAppliedOvercommitRatio from './hooks/useAppliedOvercommitRatio';
import { useMemoryRequestRatio } from './hooks/useMemoryRequestRatio';
import { getCurrentOvercommit } from './utils/utils';

type MemoryDensityProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: any];
};

const MemoryDensity: FC<MemoryDensityProps> = ({ hyperConvergeConfiguration }) => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const isAdmin = useIsAdmin();
  const [hyperConverge, hyperLoaded] = hyperConvergeConfiguration;
  const [error, setError] = useState<any>(null);

  const currentOvercommit = getCurrentOvercommit(hyperConverge);

  const { appliedRatio, isLoading: isLoadingRatio } = useAppliedOvercommitRatio();
  const { hasChanged, inputValue, isLoading, onChange, onRestoreDefault, onSave } =
    useMemoryRequestRatio({ cluster, currentOvercommit, hyperConverge });

  const handleSave = async () => {
    setError(null);
    try {
      await onSave();
    } catch (err) {
      setError(err);
    }
  };

  if (!isAdmin) return null;
  if (!hyperLoaded) return <Skeleton width={'300px'} />;

  return (
    <ExpandSectionWithCustomToggle
      customContent={<NewBadge />}
      helpTextContent={<MemoryRequestRatioHelpContent />}
      id={CLUSTER_TAB_IDS.memoryDensity}
      isIndented
      searchItemId={CLUSTER_TAB_IDS.memoryDensity}
      toggleClassname="ExpandSection"
      toggleContent={getGeneralSettingsLabels(t).memoryRequestRatio}
    >
      <Stack hasGutter>
        <StackItem>
          <ActiveRatio appliedRatio={appliedRatio} isLoadingRatio={isLoadingRatio} />
        </StackItem>

        <StackItem>
          <MemoryRequestRatioInput
            hasChanged={hasChanged}
            inputValue={inputValue}
            isLoading={isLoading}
            onChange={onChange}
            onRestoreDefault={onRestoreDefault}
            onSave={handleSave}
          />
        </StackItem>

        <GeneralSettingsError error={error} />
      </Stack>
    </ExpandSectionWithCustomToggle>
  );
};

export default MemoryDensity;
