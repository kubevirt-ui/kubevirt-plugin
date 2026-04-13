import React, { FC } from 'react';

import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DESCHEDULER_OPERATORS_URL } from '@kubevirt-utils/resources/descheduler/constants';
import { Split, SplitItem } from '@patternfly/react-core';
import SettingsLink from '@settings/context/SettingsLink';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';
import { DESCHEDULER_OPERATOR_NAME } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import {
  getInstallStateIcon,
  isInstalled,
} from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import DeschedulerSection from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/LoadBalanceSection/components/DeschedulerSection';
import HelpTextTooltipContent from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/HelpTextTooltipContent/HelpTextTooltipContent';

import IconSkeleton from '../icons/IconSkeleton/IconSkeleton';

import './LoadBalanceSection.scss';

const LoadBalanceSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const { operatorDetailsMap, operatorResourcesLoaded } = useVirtualizationFeaturesContext();
  const { installState } = operatorDetailsMap?.[DESCHEDULER_OPERATOR_NAME] || {};
  const Icon = getInstallStateIcon(installState);
  const isOperatorInstalled = isInstalled(installState);

  return (
    <ExpandSectionWithCustomToggle
      customContent={
        <Split className="load-balance-section__custom-content">
          <SplitItem className="load-balance-section__operator-hub-link" isFilled>
            {isOperatorInstalled && (
              <SettingsLink showExternalIcon to={DESCHEDULER_OPERATORS_URL}>
                {t('View Descheduler Operator')}
              </SettingsLink>
            )}
          </SplitItem>
          <SplitItem className="load-balance-section__install-state-icon">
            {operatorResourcesLoaded ? <Icon /> : <IconSkeleton />}
          </SplitItem>
        </Split>
      }
      helpTextContent={
        <HelpTextTooltipContent
          bodyText={t(
            'Load Aware Descheduler balances VM distribution across the cluster Nodes based on CPU utilization and Node CPU pressure',
          )}
          titleText={t('Load balance')}
        />
      }
      id={CLUSTER_TAB_IDS.loadBalance}
      isIndented
      searchItemId={CLUSTER_TAB_IDS.loadBalance}
      toggleClassname="ExpandSection"
      toggleContent={t('Load balance')}
    >
      <DeschedulerSection isOperatorInstalled={isOperatorInstalled} />
    </ExpandSectionWithCustomToggle>
  );
};

export default LoadBalanceSection;
