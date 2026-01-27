import React, { FormEvent, useEffect } from 'react';
import { Trans } from 'react-i18next';
import * as ipaddr from 'ipaddr.js';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Divider, FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';
import { isValidIPv4Substring, isValidIPv6Substring } from '@search/utils/validation';

import { CloudInitNetworkData } from './utils/cloudinit-utils';

type CloudinitNetworkFormProps = {
  enableNetworkData: boolean;
  networkData: CloudInitNetworkData;
  setEnableNetworkData: (value: boolean) => void;
  setSubmitDisabled: (value: boolean) => void;
  updateNetworkField: (key: keyof CloudInitNetworkData, value: string | string[]) => void;
};

export const CloudinitNetworkForm: React.FC<CloudinitNetworkFormProps> = ({
  enableNetworkData,
  networkData,
  setEnableNetworkData,
  setSubmitDisabled,
  updateNetworkField,
}) => {
  const { t } = useKubevirtTranslation();

  const gateway4 = networkData?.gateway4;
  const gateway6 = networkData?.gateway6;

  const isGateway4SubstringValid = !gateway4 || isValidIPv4Substring(networkData.gateway4);
  const isGateway6SubstringValid = !gateway6 || isValidIPv6Substring(networkData.gateway6);

  useEffect(() => {
    if (!enableNetworkData) {
      setSubmitDisabled(false);
      return;
    }

    const gateway4Invalid =
      gateway4 && (!isGateway4SubstringValid || !ipaddr.IPv4.isIPv4(gateway4));
    const gateway6Invalid =
      gateway6 && (!isGateway6SubstringValid || !ipaddr.IPv6.isIPv6(gateway6));

    setSubmitDisabled(gateway4Invalid || gateway6Invalid);
  }, [enableNetworkData, gateway4, gateway6, setSubmitDisabled]);

  return (
    <>
      <FormGroup fieldId="divider">
        <Divider />
      </FormGroup>

      <FormGroup fieldId="custom-network-checkbox">
        <Checkbox
          onChange={(_event: FormEvent<HTMLInputElement>, checked: boolean) =>
            setEnableNetworkData(checked)
          }
          description={t('check this option to add network data section to the cloud-init script.')}
          id="custom-network-checkbox"
          isChecked={enableNetworkData}
          label={t('Add network data')}
        />
      </FormGroup>
      {enableNetworkData && (
        <>
          <FormGroup
            className="kv-cloudint-advanced-tab--validation-text"
            fieldId={'ethernet-name'}
            label={t('Ethernet name')}
          >
            <TextInput
              id={'ethernet-name'}
              onChange={(_event, v) => updateNetworkField('name', v)}
              type="text"
              value={networkData?.name || ''}
            />
          </FormGroup>
          <FormGroup
            labelHelp={
              <HelpTextIcon
                bodyContent={
                  <Trans ns="plugin__kubevirt-plugin">
                    Enter one or more IP addresses and use commas to separate multiple addresses.
                    Each address should include the subnet mask to properly configure the network
                    interface.
                    <br />
                    Example: 192.168.6.25/22,2001:470:e091:6::25/64
                  </Trans>
                }
              />
            }
            className="kv-cloudint-advanced-tab--validation-text"
            fieldId={'address'}
            label={t('IP addresses')}
          >
            <TextInput
              id={'address'}
              onChange={(_event, v) => updateNetworkField('addresses', v)}
              type="text"
              value={networkData?.addresses || ''}
            />
          </FormGroup>
          <FormGroup
            className="kv-cloudint-advanced-tab--validation-text"
            fieldId={'gateway4'}
            label={t('IPv4 Gateway address')}
          >
            <TextInput
              validated={
                isGateway4SubstringValid ? ValidatedOptions.default : ValidatedOptions.warning
              }
              id={'gateway4'}
              onChange={(_event, v) => updateNetworkField('gateway4', v)}
              type="text"
              value={gateway4 || ''}
            />
            {!isGateway4SubstringValid && (
              <FormGroupHelperText validated={ValidatedOptions.warning}>
                {t('Invalid IPv4 address')}
              </FormGroupHelperText>
            )}
          </FormGroup>
          <FormGroup
            className="kv-cloudint-advanced-tab--validation-text"
            fieldId={'gateway6'}
            label={t('IPv6 Gateway address')}
          >
            <TextInput
              validated={
                isGateway6SubstringValid ? ValidatedOptions.default : ValidatedOptions.warning
              }
              id={'gateway6'}
              onChange={(_event, v) => updateNetworkField('gateway6', v)}
              type="text"
              value={gateway6 || ''}
            />
            {!isGateway6SubstringValid && (
              <FormGroupHelperText validated={ValidatedOptions.warning}>
                {t('Invalid IPv6 address')}
              </FormGroupHelperText>
            )}
          </FormGroup>
        </>
      )}
    </>
  );
};
