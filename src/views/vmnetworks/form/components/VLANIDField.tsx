import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { MAX_VLAN_ID, MIN_VLAN_ID, VMNetworkForm } from '../constants';
import { getVLANIDValidatedOption } from '../utils/utils';

const VLANIDField: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control } = useFormContext<VMNetworkForm>();

  return (
    <FormGroup
      labelHelp={
        <HelpTextIcon
          bodyContent={t(
            'Your physical network switch must be configured with a VLAN trunk that is permitted to carry traffic for this specific ID.',
          )}
          headerContent={t('VLAN ID')}
        />
      }
      fieldId="vlanID"
      label={t('VLAN ID')}
    >
      <Controller
        render={({ field: { onChange, value } }) => {
          const numberValue = (value as unknown) === '' ? NaN : value;
          const validated = getVLANIDValidatedOption(numberValue);

          return (
            <>
              <TextInput
                max={MAX_VLAN_ID}
                min={MIN_VLAN_ID}
                onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
                type="number"
                validated={validated}
                value={numberValue}
              />
              <FormGroupHelperText validated={validated}>
                {t('VLAN ID must be between {{min}}-{{max}}', {
                  max: MAX_VLAN_ID,
                  min: MIN_VLAN_ID,
                })}
              </FormGroupHelperText>
            </>
          );
        }}
        control={control}
        name="network.spec.network.localnet.vlan.access.id"
      />
    </FormGroup>
  );
};

export default VLANIDField;
