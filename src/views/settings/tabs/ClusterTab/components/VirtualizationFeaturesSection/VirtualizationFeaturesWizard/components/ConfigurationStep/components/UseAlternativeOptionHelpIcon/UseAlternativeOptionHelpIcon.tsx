import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { PopoverPosition } from '@patternfly/react-core';
import HelpTextTooltipContent from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/HelpTextTooltipContent/HelpTextTooltipContent';

type UseAlternativeOptionHelpIconProps = {
  olsPromptType: OLSPromptType;
};

const UseAlternativeOptionHelpIcon: FC<UseAlternativeOptionHelpIconProps> = ({ olsPromptType }) => {
  const { t } = useKubevirtTranslation();

  return (
    <HelpTextIcon
      bodyContent={(hide) => (
        <PopoverContentWithLightspeedButton
          content={
            <HelpTextTooltipContent
              bodyText={t(
                'Checking this will mark the feature as installed. Installation and configuration are the responsibility of the user.',
              )}
              titleText={t('Use an alternative')}
            />
          }
          hide={hide}
          promptType={olsPromptType}
        />
      )}
      helpIconClassName="pf-v6-u-ml-md"
      position={PopoverPosition.right}
    />
  );
};

export default UseAlternativeOptionHelpIcon;
