import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import InstalledIconWithTooltip from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/icons/InstalledIconWithTooltip';
import { Split, SplitItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import SwitchWithTooltip from '../HighAvailabilityConfigurationSection/components/HighAvailabilityToggleContent/SwitchWithTooltip';

import './ConfigurationToggleContent.scss';

type ConfigurationToggleContentProps = {
  disabledTooltipContent?: string;
  isInstalled: boolean;
  onSwitchChange: (newSwitchState: boolean) => void;
  operatorHubURL?: string;
  switchIsDisabled?: boolean;
  switchState: boolean;
};

const ConfigurationToggleContent: FC<ConfigurationToggleContentProps> = ({
  disabledTooltipContent = '',
  isInstalled,
  onSwitchChange,
  operatorHubURL = '',
  switchIsDisabled = false,
  switchState,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Split className="feature-configuration-toggle-content" hasGutter>
      {isInstalled && operatorHubURL && (
        <SplitItem className="feature-configuration-toggle-content__hub-link">
          <a href={operatorHubURL}>
            {t('Manage')}
            <ExternalLinkAltIcon className="feature-configuration-toggle-content__link-icon" />
          </a>
        </SplitItem>
      )}
      <SplitItem className="feature-configuration-toggle-content__icon-switch-container">
        {isInstalled ? (
          <InstalledIconWithTooltip />
        ) : (
          <SwitchWithTooltip
            disabledTooltipContent={disabledTooltipContent}
            onSwitchChange={onSwitchChange}
            switchIsDisabled={switchIsDisabled}
            switchState={switchState}
          />
        )}
      </SplitItem>
    </Split>
  );
};

export default ConfigurationToggleContent;
