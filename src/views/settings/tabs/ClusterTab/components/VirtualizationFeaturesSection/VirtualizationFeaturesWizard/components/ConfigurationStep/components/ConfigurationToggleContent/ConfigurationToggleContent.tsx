import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Split, SplitItem } from '@patternfly/react-core';
import SettingsLink from '@settings/context/SettingsLink';
import InstalledIconWithTooltip from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/icons/InstalledIconWithTooltip';

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

const ConfigurationToggleContent: FCC<ConfigurationToggleContentProps> = ({
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
          <SettingsLink forceExternal showExternalIcon to={operatorHubURL}>
            {t('Manage')}
          </SettingsLink>
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
