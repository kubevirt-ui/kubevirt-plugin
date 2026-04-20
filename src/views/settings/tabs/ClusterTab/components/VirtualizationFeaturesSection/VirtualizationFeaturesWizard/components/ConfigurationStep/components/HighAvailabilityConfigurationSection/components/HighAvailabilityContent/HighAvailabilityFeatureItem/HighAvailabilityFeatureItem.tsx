import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Checkbox, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';
import SettingsLink from '@settings/context/SettingsLink';
import { VirtualizationFeatureOperators } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { isInstalled } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import InstalledIconWithTooltip from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/icons/InstalledIconWithTooltip';

import UseAlternativeOptionCheckbox from '../../../../UseAlternativeOptionCheckbox/UseAlternativeOptionCheckbox';

import './HighAvailabilityFeatureItem.scss';

type HighAvailabilityFeatureItemProps = {
  alternativeChecked: boolean;
  checkboxLabel: string;
  description: string;
  olsPromptType: OLSPromptType;
  operatorName: VirtualizationFeatureOperators;
  setAlternativeChecked: (newCheckedState: boolean) => void;
};

const HighAvailabilityFeatureItem: FCC<HighAvailabilityFeatureItemProps> = ({
  alternativeChecked,
  checkboxLabel,
  description,
  olsPromptType,
  operatorName,
  setAlternativeChecked,
}) => {
  const { t } = useKubevirtTranslation();
  const { operatorDetailsMap, operatorsToInstall, updateInstallRequests } =
    useVirtualizationFeaturesContext();

  const { installState, operatorHubURL } = operatorDetailsMap?.[operatorName];
  const installed = isInstalled(installState);

  const handleAlternativeOptionUpdate = (newCheckedState: boolean) => {
    setAlternativeChecked(newCheckedState);
    if (newCheckedState) updateInstallRequests({ [operatorName]: false });
  };

  return (
    <Stack className="high-availability-feature-item">
      <StackItem className="high-availability-feature-item__title-row">
        <Split>
          <SplitItem className="high-availability-feature-item__checkbox-container">
            <Checkbox
              className="high-availability-feature-item__checkbox"
              id={`${operatorName}-checkbox`}
              isChecked={operatorsToInstall?.[operatorName] || installed}
              isDisabled={alternativeChecked || installed}
              label={checkboxLabel}
              onChange={(_, checked) => updateInstallRequests({ [operatorName]: checked })}
            />
          </SplitItem>
          <SplitItem>
            {installed && (
              <SettingsLink forceExternal showExternalIcon to={operatorHubURL}>
                {t('Manage')}
              </SettingsLink>
            )}
          </SplitItem>
          <SplitItem className="high-availability-feature-item__icon-container">
            {installed && <InstalledIconWithTooltip />}
          </SplitItem>
        </Split>
      </StackItem>
      <StackItem className="high-availability-feature-item__options-row">
        <UseAlternativeOptionCheckbox
          className="high-availability-feature-item__alternative-checkbox"
          id={`${operatorName}-alternative-checkbox`}
          isChecked={alternativeChecked}
          isDisabled={installed}
          olsPromptType={olsPromptType}
          onChange={handleAlternativeOptionUpdate}
        />
        <div className="high-availability-feature-item__description">{description}</div>
      </StackItem>
    </Stack>
  );
};

export default HighAvailabilityFeatureItem;
