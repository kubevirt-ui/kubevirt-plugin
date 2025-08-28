import React, { FormEvent } from 'react';
import { Trans } from 'react-i18next';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Divider, FormGroup, TextInput } from '@patternfly/react-core';

import { CloudInitNetworkData } from './utils/cloudinit-utils';

type CloudinitNetworkFormProps = {
  enableNetworkData: boolean;
  networkData: CloudInitNetworkData;
  setEnableNetworkData: (value: boolean) => void;
  updateNetworkField: (key: keyof CloudInitNetworkData, value: string | string[]) => void;
};

export const CloudinitNetworkForm: React.FC<CloudinitNetworkFormProps> = ({
  enableNetworkData,
  networkData,
  setEnableNetworkData,
  updateNetworkField,
}) => {
  const { t } = useKubevirtTranslation();

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
            fieldId={'gateway'}
            label={t('Gateway address')}
          >
            <TextInput
              id={'gateway'}
              onChange={(_event, v) => updateNetworkField('gateway4', v)}
              type="text"
              value={networkData?.gateway4 || ''}
            />
          </FormGroup>
        </>
      )}
    </>
  );
};
