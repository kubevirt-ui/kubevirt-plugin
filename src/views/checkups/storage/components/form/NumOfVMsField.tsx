import React, { type JSX } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  PopoverPosition,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';

import { isNumOfVMsInvalid, NUM_OF_VMS_MAX, NUM_OF_VMS_MIN } from '../../utils/utils';

type NumOfVMsFieldProps = {
  onNumOfVMsChange: (value: string) => void;
  value: string;
};

const NumOfVMsField = ({ onNumOfVMsChange, value }: NumOfVMsFieldProps): JSX.Element => {
  const { t } = useKubevirtTranslation();
  const isInvalid = isNumOfVMsInvalid(value);

  return (
    <FormGroup
      className="form-group-spacing"
      fieldId="num-of-vms"
      label={t('Number of VMs')}
      labelHelp={
        <HelpTextIcon
          bodyContent={t('Number of concurrent VMs to boot for testing')}
          buttonAriaLabel={t('Help for number of VMs')}
          position={PopoverPosition.right}
        />
      }
    >
      <TextInput
        className="CheckupsStorageForm--main__number-input"
        id="num-of-vms"
        max={NUM_OF_VMS_MAX}
        min={NUM_OF_VMS_MIN}
        name="num-of-vms"
        onChange={(_event, nextValue) => onNumOfVMsChange(nextValue)}
        placeholder={t('Default: 10')}
        type="number"
        validated={isInvalid ? ValidatedOptions.error : ValidatedOptions.default}
        value={value}
      />
      {isInvalid && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant="error">
              {t('Number of VMs must be a number between {{min}} and {{max}}', {
                max: NUM_OF_VMS_MAX,
                min: NUM_OF_VMS_MIN,
              })}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};

export default NumOfVMsField;
