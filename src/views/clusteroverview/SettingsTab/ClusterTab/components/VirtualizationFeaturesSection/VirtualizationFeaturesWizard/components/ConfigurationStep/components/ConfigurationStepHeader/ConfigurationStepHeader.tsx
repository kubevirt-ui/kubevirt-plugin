import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import HelpTextTooltipContent from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/HelpTextTooltipContent/HelpTextTooltipContent';
import { PopoverPosition, Title, TitleSizes } from '@patternfly/react-core';

const ConfigurationStepHeader: FC = ({}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Title className="configuration-step-header" headingLevel="h1" size={TitleSizes.lg}>
      {t('Configuration')}
      <HelpTextIcon
        bodyContent={(hide) => (
          <PopoverContentWithLightspeedButton
            content={
              <HelpTextTooltipContent
                bodyText={t(
                  'Configure the requirements for running VirtualMachines and virtualization workloads. Select the default Virtualization configurations or set it by yourself in the operator hub.',
                )}
                titleText={t('Configuration')}
              />
            }
            hide={hide}
            promptType={OLSPromptType.CONFIGURATION_FEATURE}
          />
        )}
        helpIconClassName="pf-v6-u-ml-sm"
        position={PopoverPosition.right}
      />
    </Title>
  );
};

export default ConfigurationStepHeader;
