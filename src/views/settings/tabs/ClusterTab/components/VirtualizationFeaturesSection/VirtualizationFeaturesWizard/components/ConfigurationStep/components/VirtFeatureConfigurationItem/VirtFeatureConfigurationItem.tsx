import React, { FC, ReactNode, useState } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  PopoverPosition,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Switch,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import SettingsLink from '@settings/context/SettingsLink';
import {
  InstallState,
  VirtualizationFeatureOperators,
} from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { getInstallStateIcon } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';

import './VirtFeatureConfigurationItem.scss';

type VirtFeatureConfigurationItemProps = {
  description?: string;
  helpTextContent?: ReactNode;
  operatorName: VirtualizationFeatureOperators;
  title: string;
};

const VirtFeatureConfigurationItem: FC<VirtFeatureConfigurationItemProps> = ({
  description,
  helpTextContent,
  operatorName,
  title,
}) => {
  const { t } = useKubevirtTranslation();
  const { operatorDetailsMap, updateInstallRequests } = useVirtualizationFeaturesContext();

  const [switchState, setSwitchState] = useState<boolean>(false);

  const { installState, operatorHubURL } = operatorDetailsMap?.[operatorName];
  const Icon = getInstallStateIcon(installState);
  const isInstalled = installState === InstallState.INSTALLED;

  const handleSwitchChange = (newSwitchState: boolean) => {
    setSwitchState(newSwitchState);
    updateInstallRequests({ [operatorName]: newSwitchState });
  };

  return (
    <Stack className="virt-feature-configuration-item">
      <StackItem className="virt-feature-configuration-item__header-row">
        <Split>
          <SplitItem className="virt-feature-configuration-item__title-container">
            <Title headingLevel="h2" size={TitleSizes.md}>
              {title}
            </Title>
          </SplitItem>
          {helpTextContent && (
            <SplitItem className="virt-feature-configuration-item__help-icon-container" isFilled>
              <HelpTextIcon
                bodyContent={helpTextContent}
                helpIconClassName="featured-operator-item__help-icon"
                position={PopoverPosition.right}
              />
            </SplitItem>
          )}
          {isInstalled && (
            <SplitItem className="virt-feature-configuration-item__hub-link">
              <SettingsLink forceExternal showExternalIcon to={operatorHubURL}>
                {t('Manage')}
              </SettingsLink>
            </SplitItem>
          )}
          <SplitItem className="featured-operator-item__icon-container">
            {isInstalled ? (
              <Icon />
            ) : (
              <Switch
                data-test-id={operatorName}
                isChecked={switchState}
                onChange={(_, checked: boolean) => handleSwitchChange(checked)}
              />
            )}
          </SplitItem>
        </Split>
      </StackItem>
      {description && <StackItem>{description}</StackItem>}
    </Stack>
  );
};

export default VirtFeatureConfigurationItem;
