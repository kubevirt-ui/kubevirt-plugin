import React, { FC, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import SelectTypeahead from '@kubevirt-utils/components/SelectTypeahead/SelectTypeahead';
import { MAX_MTU } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VLAN_MODE_ACCESS } from '@kubevirt-utils/resources/udn/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
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

import usePhysicalNetworkOptions from '../../hooks/usePhysicalNetworkOptions';
import { DEFAULT_MTU, VMNetworkForm } from '../constants';
import useMaxMTU from '../hooks/useMaxMTU';
import { getMTUValidatedInfo } from '../utils/utils';

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
    if (mtu === null) {
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
        labelHelp={
          <HelpTextIcon
            bodyContent={t(
              'The network connects to a physical network through an Open vSwitch bridge.',
            )}
            headerContent={t('Physical network')}
          />
        }
        fieldId="bridge-mapping"
        isRequired
        label={t('Physical network')}
      >
        <Controller
          render={({ field: { onChange, value } }) => (
            <SelectTypeahead
              setSelectedValue={(newSelection) => {
                onChange(newSelection);
              }}
              isFullWidth
              options={physicalNetworkOptions ?? []}
              selectedValue={value}
            />
          )}
          control={control}
          name="network.spec.network.localnet.physicalNetworkName"
        />
      </FormGroup>

      <FormGroup
        labelHelp={
          <HelpTextIcon
            bodyContent={t(
              'The largest size of a data packet, in bytes, that can be transmitted across this network. It is critical that the entire underlying physical network infrastructure also supports the same or larger MTU size to avoid packet fragmentation and connectivity issues.',
            )}
            headerContent={t('Maximum Transmission Unit (MTU)')}
          />
        }
        fieldId="mtu"
        isRequired
        label={t('MTU')}
      >
        <Controller
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
          control={control}
          name="network.spec.network.localnet.mtu"
        />
      </FormGroup>
      <Controller
        render={({ field: { onChange, value: vlan } }) => (
          <>
            <Split hasGutter>
              <Checkbox
                onChange={(_, checked) =>
                  onChange(checked ? { access: { id: '' }, mode: VLAN_MODE_ACCESS } : null)
                }
                id="vlan-enabled"
                isChecked={!isEmpty(vlan?.mode)}
                label={t('VLAN tagging')}
              />
              <SplitItem>
                <HelpTextIcon
                  bodyContent={t(
                    "Tags the virtual machine's network traffic with a specific VLAN ID (IEEE 802.1Q) to isolate it within a designated virtual network on the physical LAN.",
                  )}
                  headerContent={t('VLAN tagging')}
                />
              </SplitItem>
            </Split>

            {!isEmpty(vlan?.access) && <VLANIDField />}
          </>
        )}
        control={control}
        name="network.spec.network.localnet.vlan"
      />
    </Form>
  );
};

export default NetworkDefinition;
