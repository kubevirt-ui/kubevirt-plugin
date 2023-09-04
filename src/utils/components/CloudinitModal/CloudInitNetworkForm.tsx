import React from 'react';

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
          description={t('check this option to add network data section to the cloud-init script.')}
          id="custom-network-checkbox"
          isChecked={enableNetworkData}
          label={t('Add network data')}
          onChange={setEnableNetworkData}
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
              onChange={(v) => updateNetworkField('name', v)}
              type="text"
              value={networkData?.name || ''}
            />
          </FormGroup>
          <FormGroup
            className="kv-cloudint-advanced-tab--validation-text"
            fieldId={'address'}
            helperText={t('Use commas to separate between IP addresses')}
            label={t('IP addresses')}
          >
            <TextInput
              id={'address'}
              onChange={(v) => updateNetworkField('address', v)}
              type="text"
              value={networkData?.address || ''}
            />
          </FormGroup>
          <FormGroup
            className="kv-cloudint-advanced-tab--validation-text"
            fieldId={'gateway'}
            label={t('Gateway address')}
          >
            <TextInput
              id={'gateway'}
              onChange={(v) => updateNetworkField('gateway', v)}
              type="text"
              value={networkData?.gateway || ''}
            />
          </FormGroup>
        </>
      )}
    </>
  );
};
