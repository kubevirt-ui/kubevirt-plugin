import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import HelpTextTooltipContent from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/HelpTextTooltipContent/HelpTextTooltipContent';
import { PopoverPosition } from '@patternfly/react-core';

import './UseAlternativeOptionHelpIcon.scss';

const UseAlternativeOptionHelpIcon: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <HelpTextIcon
      bodyContent={
        <HelpTextTooltipContent
          bodyText={t(
            'Checking this will mark the feature as installed. Installation and configuration are the responsibility of the user.',
          )}
          titleText={t('Use an alternative')}
        />
      }
      helpIconClassName="use-alternative-option-help-icon"
      position={PopoverPosition.right}
    />
  );
};

export default UseAlternativeOptionHelpIcon;
