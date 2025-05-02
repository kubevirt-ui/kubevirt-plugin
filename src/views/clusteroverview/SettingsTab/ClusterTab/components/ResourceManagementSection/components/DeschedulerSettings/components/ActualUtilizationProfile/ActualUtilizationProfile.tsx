import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Form, FormGroup, Radio, Split, SplitItem, Stack, Switch } from '@patternfly/react-core';

import { Customizations } from '../../utils/constants';
import { ActualUtilizationProfileValues } from '../../utils/constants';
import {
  addDeschedulerValue,
  removeDeschedulerValue,
  updateDeschedulerValue,
} from '../../utils/deschedulerAPI';

import { options } from './options';

type ActualUtilizationProfileProps = {
  utilizationProfile: ActualUtilizationProfileValues;
};

const ActualUtilizationProfile: FC<ActualUtilizationProfileProps> = ({ utilizationProfile }) => {
  const isEnabled = !!utilizationProfile;
  const yamlPath = '/spec/profileCustomizations/devActualUtilizationProfile';

  const onSwitchChange = (isChecked: boolean) => {
    if (isChecked) {
      addDeschedulerValue(yamlPath, ActualUtilizationProfileValues.PrometheusCPUCombined);
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
          {Customizations.ActualUtilizationProfile}{' '}
          <HelpTextIcon
            bodyContent={t(
              'Sets a profile that gets translated into a predefined prometheus query.',
            )}
          />
        </SplitItem>
        <SplitItem>
          <Switch isChecked={isEnabled} onChange={(_, checked) => onSwitchChange(checked)} />
        </SplitItem>
      </Split>
      {isEnabled && (
        <Form>
          <FormGroup fieldId="ActualUtilizationProfile-radio-group" isStack role="radiogroup">
            {options.map((option) => (
              <Radio
                id={`ActualUtilizationProfile-radio--${option.value}`}
                isChecked={utilizationProfile === option.value}
                key={option.value}
                name="ActualUtilizationProfile-radio"
                onChange={onRadioChange}
                {...option}
              />
            ))}
          </FormGroup>
        </Form>
      )}
    </Stack>
  );
};

export default ActualUtilizationProfile;
