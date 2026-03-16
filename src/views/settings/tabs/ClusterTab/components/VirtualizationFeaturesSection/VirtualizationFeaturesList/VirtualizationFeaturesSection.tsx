import React, { FC } from 'react';

import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useManagedClusterConsoleURLs from '@multicluster/hooks/useManagedClusterConsoleURLs';
import { Stack, StackItem } from '@patternfly/react-core';
import {
  useIsSettingsSpokeCluster,
  useSettingsCluster,
} from '@settings/context/SettingsClusterContext';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import {
  CLUSTER_OBSERVABILITY_OPERATOR_NAME,
  NETOBSERV_OPERATOR_NAME,
  NMSTATE_OPERATOR_NAME,
} from '../utils/constants';

import ConfigureButton from './components/ConfigureButton/ConfigureButton';
import FeaturedOperatorItem from './components/FeaturedOperatorItem';
import HighAvailabilitySection from './components/HighAvailabilitySection/HighAvailabilitySection';
import LoadBalanceSection from './components/LoadBalanceSection/LoadBalanceSection';

import './VirtualizationFeaturesSection.scss';

const VirtualizationFeaturesSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const isSpokeCluster = useIsSettingsSpokeCluster();
  const { getConsoleURL } = useManagedClusterConsoleURLs();
  const spokeConsoleURL = isSpokeCluster ? getConsoleURL(cluster) : undefined;

  return (
    <ExpandSectionWithCustomToggle
      className="virtualization-features-section"
      customContent={<ConfigureButton spokeConsoleURL={spokeConsoleURL} />}
      id="virtualization-features-section"
      isIndented
      searchItemId={CLUSTER_TAB_IDS.virtualizationFeatures}
      toggleClassname="ExpandSection"
      toggleContent={t('Virtualization features')}
    >
      <Stack hasGutter>
        <StackItem isFilled>
          <FeaturedOperatorItem
            isNew
            operatorName={CLUSTER_OBSERVABILITY_OPERATOR_NAME}
            title={t('Cluster observability (COO)')}
          />
        </StackItem>
        <StackItem isFilled>
          <FeaturedOperatorItem
            operatorName={NETOBSERV_OPERATOR_NAME}
            title={t('Network observability')}
          />
        </StackItem>
        <StackItem isFilled>
          <FeaturedOperatorItem
            operatorName={NMSTATE_OPERATOR_NAME}
            title={t('Host network management (NMState)')}
          />
        </StackItem>
        <StackItem isFilled>
          <HighAvailabilitySection />
        </StackItem>
        <StackItem isFilled>
          <LoadBalanceSection />
        </StackItem>
      </Stack>
    </ExpandSectionWithCustomToggle>
  );
};

export default VirtualizationFeaturesSection;
