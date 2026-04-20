import React, { FCC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Content } from '@patternfly/react-core';

const DeschedulerThresholdHelp: FCC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <HelpTextIcon
      bodyContent={(hide) => (
        <PopoverContentWithLightspeedButton
          content={
            <Content>
              <p>
                {t(
                  'Thresholds signify the distance from the average node utilization (formatted as below:above). An Asymmetric deviation threshold will force all nodes below the average to be considered as underutilized to help rebalancing overutilized outliers.',
                )}
              </p>
              <hr />
              <p>
                {t(
                  'E.g., 0%:10% means to mark every node with utilization below average as underutilized, and every node with utilization more than 10% above average as overutilized.',
                )}
              </p>
            </Content>
          }
          hide={hide}
          promptType={OLSPromptType.DESCHEDULER_THRESHOLDS}
        />
      )}
      helpIconClassName="pf-v6-u-ml-md"
    />
  );
};

export default DeschedulerThresholdHelp;
