import React, { type FC } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import SelectTypeahead from '@kubevirt-utils/components/SelectTypeahead/SelectTypeahead';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

import NetworkSelectHelperPopover from './components/NetworkSelectHelperPopover';
import { type NetworkInterfaceNetworkSelectProps } from './types';
import useNetworkInterfaceData from './useNetworkInterfaceData';
import { createNewNetworkOption, getCreateNetworkOption } from './utils';

export type { NetworkSelectTypeaheadOptionProps } from './types';

const NetworkInterfaceNetworkSelect: FC<NetworkInterfaceNetworkSelectProps> = (props) => {
  const {
    handleChange,
    loaded,
    networkOptions,
    selectNetworkName,
    selectTypeaheadKey,
    setCreatedNetworkOptions,
    t,
    validated,
    validators,
  } = useNetworkInterfaceData(props);

  return (
    <FormGroup
      fieldId="network-attachment-definition"
      isRequired
      label={t('Network')}
      labelHelp={<NetworkSelectHelperPopover />}
    >
      <div data-test-id="network-attachment-definition-select">
        <SelectTypeahead
          addOption={(value) => {
            const hasErrors = validators
              .map((getErrorMsg) => getErrorMsg(value))
              .filter(Boolean).length;
            if (hasErrors) {
              return false;
            }
            setCreatedNetworkOptions((prev) => [
              ...prev.filter((option) => option.value !== value),
              createNewNetworkOption(value, t),
            ]);
            return true;
          }}
          canCreate
          dataTestId="select-nad"
          getCreateAction={getCreateNetworkOption(validators)}
          isFullWidth
          key={selectTypeaheadKey}
          options={networkOptions}
          placeholder={t('Select a NetworkAttachmentDefinition')}
          selectedValue={selectNetworkName}
          setSelectedValue={handleChange}
        />
      </div>
      {loaded && validated === ValidatedOptions.error && (
        <FormGroupHelperText validated={validated}>
          {t(
            'No NetworkAttachmentDefinitions available. Contact your system administrator for additional support.',
          )}
        </FormGroupHelperText>
      )}
    </FormGroup>
  );
};

export default NetworkInterfaceNetworkSelect;
