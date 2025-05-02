import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Radio, Split, SplitItem, Stack, Switch } from '@patternfly/react-core';

import { Customizations } from '../../utils/constants';
import { LowNodeUtilizationThresholdsValues } from '../../utils/constants';
import {
  addDeschedulerValue,
  removeDeschedulerValue,
  updateDeschedulerValue,
} from '../../utils/deschedulerAPI';

import { options } from './options';

type LowNodeUtilizationThresholdsProps = {
  threshold: LowNodeUtilizationThresholdsValues;
};

const LowNodeUtilizationThresholds: FC<LowNodeUtilizationThresholdsProps> = ({ threshold }) => {
  const isEnabled = !!threshold;
  const yamlPath = '/spec/profileCustomizations/devLowNodeUtilizationThresholds';

  const onSwitchChange = (isChecked: boolean) => {
    if (isChecked) {
      addDeschedulerValue(yamlPath, LowNodeUtilizationThresholdsValues.Low);
    } else {
      removeDeschedulerValue(yamlPath);
    }
  };

  const onRadioChange = (event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
    if (checked) {
      updateDeschedulerValue(yamlPath, event.currentTarget.value);
    }
  };

  return (
    <Stack hasGutter>
      <Split>
        <SplitItem isFilled>
          {Customizations.LowNodeUtilizationThresholds}{' '}
          <HelpTextIcon
            bodyContent={t(
              'Sets experimental thresholds for the LowNodeUtilization strategy of the LifecycleAndUtilization profile.',
            )}
          />
        </SplitItem>
        <SplitItem>
          <Switch isChecked={isEnabled} onChange={(_, checked) => onSwitchChange(checked)} />
        </SplitItem>
      </Split>
      {isEnabled && (
        <FormGroup fieldId="LowNodeUtilizationThresholds-radio-group" isInline role="radiogroup">
          {options.map(({ label, value }) => (
            <Radio
              id={`LowNodeUtilizationThresholds-radio--${value}`}
              isChecked={threshold === value}
              key={value}
              label={label}
              name="LowNodeUtilizationThresholds-radio"
              onChange={onRadioChange}
              value={value}
            />
          ))}
        </FormGroup>
      )}
    </Stack>
  );
};

export default LowNodeUtilizationThresholds;
