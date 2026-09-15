import { type FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { MAX_MTU } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { type VMNetworkForm } from '../constants';

import { getMTUValidatedInfo } from '../utils/utils';

type MTUFieldProps = {
  maxMTUFromLocalnet: number;
};

const MTUField: FC<MTUFieldProps> = ({ maxMTUFromLocalnet }) => {
  const { t } = useKubevirtTranslation();
  const { control } = useFormContext<VMNetworkForm>();

  return (
    <FormGroup
      fieldId="mtu"
      isRequired
      label={t('MTU')}
      labelHelp={
        <HelpTextIcon
          bodyContent={(hide) => (
            <PopoverContentWithLightspeedButton
              content={t(
                'The largest size of a data packet, in bytes, that can be transmitted across this network. It is critical that the entire underlying physical network infrastructure also supports the same or larger MTU size to avoid packet fragmentation and connectivity issues.',
              )}
              hide={hide}
              promptType={OLSPromptType.MTU}
            />
          )}
          headerContent={t('Maximum Transmission Unit (MTU)')}
        />
      }
    >
      <Controller
        control={control}
        name="network.spec.network.localnet.mtu"
        render={({ field: { onChange, value } }) => {
          const { message, validated } = getMTUValidatedInfo(value, maxMTUFromLocalnet, t);
          return (
            <>
              <TextInput
                max={MAX_MTU}
                min={0}
                onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
                type="number"
                validated={validated}
                value={value}
              />
              {message && (
                <FormGroupHelperText validated={validated}>{message}</FormGroupHelperText>
              )}
            </>
          );
        }}
      />
    </FormGroup>
  );
};

export default MTUField;
