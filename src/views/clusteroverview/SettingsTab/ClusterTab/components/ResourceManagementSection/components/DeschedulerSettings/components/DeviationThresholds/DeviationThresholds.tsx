import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Split, SplitItem, Stack, Switch } from '@patternfly/react-core';
import { SimpleSelect } from '@patternfly/react-templates';

import { Customizations, defaultDescheduler } from '../../utils/constants';
import { DeviationThresholdsValues } from '../../utils/constants';
import {
  addDeschedulerValue,
  removeDeschedulerValue,
  updateDeschedulerValue,
} from '../../utils/deschedulerAPI';

import { options } from './options';

type DeviationThresholdsProps = {
  threshold: DeviationThresholdsValues;
};

const DeviationThresholds: FC<DeviationThresholdsProps> = ({ threshold }) => {
  const isEnabled = !!threshold;
  const yamlPath = '/spec/profileCustomizations/devDeviationThresholds';
  const defaultThresholdValue =
    defaultDescheduler.spec.profileCustomizations.devDeviationThresholds;

  const onSwitchChange = (isChecked: boolean) => {
    if (isChecked) {
      addDeschedulerValue(yamlPath, defaultThresholdValue);
    } else {
      removeDeschedulerValue(yamlPath);
    }
  };

  const onThresholdSelect = (value: DeviationThresholdsValues) => {
    updateDeschedulerValue(yamlPath, value);
  };

  return (
    <Stack hasGutter>
      <Split>
        <SplitItem isFilled>
          {Customizations.DeviationThresholds}{' '}
          <HelpTextIcon
            bodyContent={t(
              'Have the thresholds be based on the average utilization. Thresholds signify the distance from the average node utilization. An AsymmetricDeviationThreshold will force all nodes below the average to be considered as underutilized to help rebalancing overutilized outliers.',
            )}
          />
        </SplitItem>
        <SplitItem>
          <Switch isChecked={isEnabled} onChange={(_, checked) => onSwitchChange(checked)} />
        </SplitItem>
      </Split>
      {isEnabled && (
        <SimpleSelect
          placeholder={options
            .find((option) => option.value === (threshold ?? defaultThresholdValue))
            .content.toString()}
          initialOptions={options}
          onSelect={(_event, value: DeviationThresholdsValues) => onThresholdSelect(value)}
          toggleWidth="260px"
        />
      )}
    </Stack>
  );
};

export default DeviationThresholds;
