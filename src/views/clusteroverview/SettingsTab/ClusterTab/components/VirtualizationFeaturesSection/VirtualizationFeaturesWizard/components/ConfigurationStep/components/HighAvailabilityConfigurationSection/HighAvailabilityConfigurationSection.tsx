import React, { FC, useState } from 'react';

import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import {
  FENCE_AGENTS_OPERATOR_NAME,
  NODE_HEALTH_OPERATOR_NAME,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import HighAvailabilityToggleContent from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/HighAvailabilityConfigurationSection/components/HighAvailabilityToggleContent/HighAvailabilityToggleContent';
import { HAAlternativeCheckedMap } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/HighAvailabilityConfigurationSection/utils/types';
import HelpTextTooltipContent from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/HelpTextTooltipContent/HelpTextTooltipContent';

import HighAvailabilityContent from './components/HighAvailabilityContent/HighAvailabilityContent';

import './HighAvailabilityConfigurationSection.scss';

const HighAvailabilityConfigurationSection: FC = () => {
  const { t } = useKubevirtTranslation();

  const [alternativeCheckedMap, setAlternativeCheckedMap] = useState<HAAlternativeCheckedMap>({
    [FENCE_AGENTS_OPERATOR_NAME]: false,
    [NODE_HEALTH_OPERATOR_NAME]: false,
  });

  return (
    <ExpandSectionWithCustomToggle
      customContent={
        <HighAvailabilityToggleContent alternativeCheckedMap={alternativeCheckedMap} />
      }
      helpTextContent={(hide) => (
        <PopoverContentWithLightspeedButton
          content={
            <HelpTextTooltipContent
              bodyText={t(
                "The feature's availability is dependent on two required operators to be installed and enabled.",
              )}
              linkURL="https://access.redhat.com/articles/7057929"
              titleText={t('High availability')}
            />
          }
          hide={hide}
          promptType={OLSPromptType.HIGH_AVAILABILITY_FEATURE}
        />
      )}
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
