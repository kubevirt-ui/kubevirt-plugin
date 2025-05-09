import React, { FC } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Form, FormGroup, Radio, Stack } from '@patternfly/react-core';

import { DeschedulerMode } from '../../utils/constants';
import { updateDeschedulerValue } from '../../utils/deschedulerAPI';

type DeschedulerModeRadioProps = {
  mode: DeschedulerMode;
};

const DeschedulerModeRadio: FC<DeschedulerModeRadioProps> = ({ mode }) => {
  const handleChange = (event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
    if (checked) {
      updateDeschedulerValue('/spec/mode', event.currentTarget.value);
    }
  };

  return (
    <Stack hasGutter>
      <span>{t('Mode')}</span>
      <Form>
        <FormGroup fieldId="Mode-radio-group" isInline role="radiogroup">
          {Object.values(DeschedulerMode).map((value) => (
            <Radio
              id={`Mode-radio--${value}`}
              isChecked={mode === value}
              key={value}
              label={value}
              name="Mode-radio"
              onChange={handleChange}
              value={value}
            />
          ))}
        </FormGroup>
      </Form>
    </Stack>
  );
};

export default DeschedulerModeRadio;
