import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualizationFeatureOperators } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { isInstalled } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import InstalledIconWithTooltip from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/icons/InstalledIconWithTooltip';
import { Checkbox, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import UseAlternativeOptionCheckbox from '../../../../UseAlternativeOptionCheckbox/UseAlternativeOptionCheckbox';

import './HighAvailabilityFeatureItem.scss';

type HighAvailabilityFeatureItemProps = {
  alternativeChecked: boolean;
  checkboxLabel: string;
  description: string;
  operatorName: VirtualizationFeatureOperators;
  setAlternativeChecked: (newCheckedState: boolean) => void;
};

const HighAvailabilityFeatureItem: FC<HighAvailabilityFeatureItemProps> = ({
  alternativeChecked,
  checkboxLabel,
  description,
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
            {installed && <ExternalLink href={operatorHubURL}>{t('Manage')}</ExternalLink>}
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
          onChange={handleAlternativeOptionUpdate}
        />
        <div className="high-availability-feature-item__description">{description}</div>
      </StackItem>
    </Stack>
  );
};

export default HighAvailabilityFeatureItem;
