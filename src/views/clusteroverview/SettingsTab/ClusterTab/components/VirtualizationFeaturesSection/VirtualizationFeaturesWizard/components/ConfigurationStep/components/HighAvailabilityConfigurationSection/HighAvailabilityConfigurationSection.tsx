import React, { FC, useState } from 'react';

import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  FENCE_AGENTS_OPERATOR_NAME,
  NODE_HEALTH_OPERATOR_NAME,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { isInstalled } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import { HAAlternativeCheckedMap } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/HighAvailabilityConfigurationSection/utils/types';
import { getDisabledSwitchTooltipMsg } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/HighAvailabilityConfigurationSection/utils/utils';
import HelpTextTooltipContent from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/HelpTextTooltipContent/HelpTextTooltipContent';

import ConfigurationToggleContent from '../ConfigurationToggleContent/ConfigurationToggleContent';

import HighAvailabilityContent from './components/HighAvailabilityContent/HighAvailabilityContent';

import './HighAvailabilityConfigurationSection.scss';

const HighAvailabilityConfigurationSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const { operatorDetailsMap, operatorsToInstall } = useVirtualizationFeaturesContext();
  const [switchState, setSwitchState] = useState<boolean>(false);

  const [alternativeCheckedMap, setAlternativeCheckedMap] = useState<HAAlternativeCheckedMap>({
    [FENCE_AGENTS_OPERATOR_NAME]: false,
    [NODE_HEALTH_OPERATOR_NAME]: false,
  });
  const bothAlternativeOptionsChecked = Object.values(alternativeCheckedMap).every(
    (checked) => checked,
  );

  const nhcInstalled = isInstalled(operatorDetailsMap?.[NODE_HEALTH_OPERATOR_NAME]?.installState);
  const farInstalled = isInstalled(operatorDetailsMap?.[FENCE_AGENTS_OPERATOR_NAME]?.installState);

  const haFeatureInstalled = (nhcInstalled && farInstalled) || bothAlternativeOptionsChecked;
  const switchIsDisabled =
    !operatorsToInstall[FENCE_AGENTS_OPERATOR_NAME] ||
    !operatorsToInstall[NODE_HEALTH_OPERATOR_NAME];

  return (
    <ExpandSectionWithCustomToggle
      customContent={
        <ConfigurationToggleContent
          disabledTooltipContent={getDisabledSwitchTooltipMsg(nhcInstalled, farInstalled)}
          isInstalled={haFeatureInstalled}
          onSwitchChange={setSwitchState}
          switchIsDisabled={switchIsDisabled}
          switchState={switchState}
        />
      }
      helpTextContent={
        <HelpTextTooltipContent
          bodyText={t(
            "The feature's availability is dependent on two required operators to be installed and enabled.",
          )}
          linkURL="https://access.redhat.com/articles/7057929"
          titleText={t('High availability')}
        />
      }
      expandSectionClassName="high-availability-configuration-section__expand-section"
      id="high-availability-configuration-section"
      isIndented
      toggleClassname="high-availability-configuration-section__toggle"
      toggleContent={t('High availability')}
    >
      <HighAvailabilityContent
        alternativeCheckedMap={alternativeCheckedMap}
        setAlternativeCheckedMap={setAlternativeCheckedMap}
      />
    </ExpandSectionWithCustomToggle>
  );
};

export default HighAvailabilityConfigurationSection;
