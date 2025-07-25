import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubeDescheduler from '@kubevirt-utils/resources/descheduler/hooks/useKubeDescheduler';
import { getDeviationThreshold } from '@kubevirt-utils/resources/descheduler/selectors';
import { DeviationThreshold } from '@kubevirt-utils/resources/descheduler/types';
import { updateDeviationThreshold } from '@kubevirt-utils/resources/descheduler/utils';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { Radio, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import './DeschedulerSection.scss';

const DeschedulerSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const { descheduler, deschedulerLoaded } = useKubeDescheduler();
  const [selectedLevel, setSelectedLevel] = useState<DeviationThreshold>(
    getDeviationThreshold(descheduler) || DeviationThreshold.Medium,
  );

  const handleDeviationThresholdChange = (selectedThreshold: DeviationThreshold) => {
    setSelectedLevel(selectedThreshold);
    updateDeviationThreshold(descheduler, selectedThreshold).catch((err) =>
      kubevirtConsole.error(err),
    );
  };

  const isDisabled = !deschedulerLoaded || isEmpty(descheduler);

  return (
    <div className="descheduler-section">
      <Stack hasGutter>
        <StackItem>
          <h3 className="descheduler-section__header">{t('Kube Descheduler')}</h3>
        </StackItem>
        <StackItem>
          {t(
            'The Kube Descheduler Operator provides the ability to evict a running Pod so that the Pod can be rescheduled onto a more suitable Node.',
          )}
        </StackItem>
        <StackItem>{t('You can set a target balance level to guide the process.')}</StackItem>
        <StackItem>
          <Split className="descheduler-section__radio-group" hasGutter>
            <SplitItem isFilled>
              <Radio
                id={DeviationThreshold.Low}
                isChecked={selectedLevel === DeviationThreshold.Low}
                isDisabled={isDisabled}
                label={t('Low')}
                name="descheduler-balance-level-selection"
                onChange={() => handleDeviationThresholdChange(DeviationThreshold.Low)}
              />
            </SplitItem>
            <SplitItem isFilled>
              <Radio
                id={DeviationThreshold.Medium}
                isChecked={selectedLevel === DeviationThreshold.Medium}
                isDisabled={isDisabled}
                label={t('Medium')}
                name="descheduler-balance-level-selection"
                onChange={() => handleDeviationThresholdChange(DeviationThreshold.Medium)}
              />
            </SplitItem>
            <SplitItem>
              <Radio
                id={DeviationThreshold.High}
                isChecked={selectedLevel === DeviationThreshold.High}
                isDisabled={isDisabled}
                label={t('High')}
                name="descheduler-balance-level-selection"
                onChange={() => handleDeviationThresholdChange(DeviationThreshold.High)}
              />
            </SplitItem>
          </Split>
        </StackItem>
      </Stack>
    </div>
  );
};

export default DeschedulerSection;
