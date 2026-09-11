import { type FC, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import SelectTypeahead from '@kubevirt-utils/components/SelectTypeahead/SelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VLAN_MODE_ACCESS } from '@kubevirt-utils/resources/udn/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import {
  Alert,
  Checkbox,
  Form,
  FormGroup,
  Split,
  SplitItem,
  Stack,
  TextInput,
  Title,
} from '@patternfly/react-core';

import { DEFAULT_MTU, type VMNetworkForm } from '../constants';

import usePhysicalNetworkOptions from '../../hooks/usePhysicalNetworkOptions';
import useMaxMTU from '../hooks/useMaxMTU';
import MTUField from './MTUField';
import VLANIDField from './VLANIDField';

import './NetworkDefinition.scss';

const NetworkDefinition: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control, register, setValue, watch } = useFormContext<VMNetworkForm>();

  const localnet = watch('network.spec.network.localnet.physicalNetworkName');
  const mtu = watch('network.spec.network.localnet.mtu');

  const [physicalNetworkOptions, nncpSpecListForLocalnet] = usePhysicalNetworkOptions();
  const maxMTUFromLocalnet = useMaxMTU(localnet, nncpSpecListForLocalnet);

  useEffect(() => {
    if (mtu == null) {
      setValue(
        'network.spec.network.localnet.mtu',
        maxMTUFromLocalnet === Infinity ? DEFAULT_MTU : maxMTUFromLocalnet,
      );
    }
  }, [maxMTUFromLocalnet, mtu, setValue]);

  return (
    <Form className="network-definition">
      <Stack hasGutter>
        <Title headingLevel="h2">{t('Network definition')}</Title>
        <Alert
          isInline
          isPlain
          title={t('This configuration is not editable after the network is created.')}
          variant="info"
        />
      </Stack>

      <FormGroup fieldId="name" isRequired label={t('Name')}>
        <TextInput {...register('network.metadata.name', { required: true })} />
      </FormGroup>
      <FormGroup fieldId="description" label={t('Description')}>
        <TextInput {...register('network.metadata.annotations.description', { required: false })} />
      </FormGroup>

      <FormGroup
        fieldId="bridge-mapping"
        isRequired
        label={t('Physical network')}
        labelHelp={
          <HelpTextIcon
            bodyContent={t(
              'The network connects to a physical network through an Open vSwitch bridge.',
            )}
            headerContent={t('Physical network')}
          />
        }
      >
        <Controller
          control={control}
          name="network.spec.network.localnet.physicalNetworkName"
          render={({ field: { onChange, value } }) => (
            <SelectTypeahead
              isFullWidth
              options={physicalNetworkOptions ?? []}
              selectedValue={value}
              setSelectedValue={(newSelection) => {
                onChange(newSelection);
              }}
            />
          )}
        />
      </FormGroup>

      <MTUField maxMTUFromLocalnet={maxMTUFromLocalnet} />
      <Controller
        control={control}
        name="network.spec.network.localnet.vlan"
        render={({ field: { onChange, value: vlan } }) => (
          <>
            <Split hasGutter>
              <Checkbox
                id="vlan-enabled"
                isChecked={!isEmpty(vlan?.mode)}
                label={t('VLAN tagging')}
                onChange={(_event, checked) =>
                  onChange(checked ? { access: { id: '' }, mode: VLAN_MODE_ACCESS } : null)
                }
              />
              <SplitItem>
                <HelpTextIcon
                  bodyContent={(hide) => (
                    <PopoverContentWithLightspeedButton
                      content={t(
                        "Tags the virtual machine's network traffic with a specific VLAN ID (IEEE 802.1Q) to isolate it within a designated virtual network on the physical LAN.",
                      )}
                      hide={hide}
                      promptType={OLSPromptType.VLAN_TAGGING}
                    />
                  )}
                  headerContent={t('VLAN tagging')}
                />
              </SplitItem>
            </Split>

            {!isEmpty(vlan?.access) && <VLANIDField />}
          </>
        )}
      />
    </Form>
  );
};

export default NetworkDefinition;
