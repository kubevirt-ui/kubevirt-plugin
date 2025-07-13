import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import HelpTextTooltipContent from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/HelpTextTooltipContent/HelpTextTooltipContent';
import { PopoverPosition, Title, TitleSizes } from '@patternfly/react-core';

import './ConfigurationStepHeader.scss';

const ConfigurationStepHeader: FC = ({}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Title className="configuration-step-header" headingLevel="h1" size={TitleSizes.lg}>
      {t('Configuration')}
      <HelpTextIcon
        bodyContent={
          <HelpTextTooltipContent
            bodyText={t(
              'Configure the requirements for running VirtualMachines and virtualization workloads. Select the default Virtualization configurations or set it by yourself in the operator hub.',
            )}
            titleText={t('Configuration')}
          />
        }
        helpIconClassName="configuration-step-header__icon"
        position={PopoverPosition.right}
      />
    </Title>
  );
};

export default ConfigurationStepHeader;
