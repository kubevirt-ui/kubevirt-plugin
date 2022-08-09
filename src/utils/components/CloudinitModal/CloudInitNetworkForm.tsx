import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Divider, FormGroup, TextInput } from '@patternfly/react-core';

import { CloudInitNetworkData } from './utils/cloudinit-utils';

type CloudinitNetworkFormProps = {
  enableNetworkData: boolean;
  networkData: CloudInitNetworkData;
  updateNetworkField: (key: keyof CloudInitNetworkData, value: string | string[]) => void;
  setEnableNetworkData: (value: boolean) => void;
};

export const CloudinitNetworkForm: React.FC<CloudinitNetworkFormProps> = ({
  networkData,
  updateNetworkField,
  enableNetworkData,
  setEnableNetworkData,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <FormGroup fieldId="divider">
        <Divider />
      </FormGroup>

      <FormGroup fieldId="custom-network-checkbox">
        <Checkbox
          id="custom-network-checkbox"
          label={t('Add network data')}
          description={t('check this option to add network data section to the cloud-init script.')}
          isChecked={enableNetworkData}
          onChange={setEnableNetworkData}
        />
      </FormGroup>
      {enableNetworkData && (
        <>
          <FormGroup
            label={t('Ethernet name')}
            fieldId={'ethernet-name'}
            className="kv-cloudint-advanced-tab--validation-text"
          >
            <TextInput
              value={networkData?.name || ''}
              type="text"
              id={'ethernet-name'}
              onChange={(v) => updateNetworkField('name', v)}
            />
          </FormGroup>
          <FormGroup
            label={t('IP addresses')}
            fieldId={'address'}
            className="kv-cloudint-advanced-tab--validation-text"
            helperText={t('Use commas to separate between IP addresses')}
          >
            <TextInput
              value={networkData?.address}
              type="text"
              id={'address'}
              onChange={(v) => updateNetworkField('address', v)}
            />
          </FormGroup>
          <FormGroup
            label={t('Gateway address')}
            fieldId={'gateway'}
            className="kv-cloudint-advanced-tab--validation-text"
          >
            <TextInput
              value={networkData?.gateway || ''}
              type="text"
              id={'gateway'}
              onChange={(v) => updateNetworkField('gateway', v)}
            />
          </FormGroup>
        </>
      )}
    </>
  );
};
