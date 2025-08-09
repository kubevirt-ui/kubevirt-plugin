import React, { Dispatch, FC, MouseEvent, SetStateAction } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { describeNetworkState } from '@kubevirt-utils/components/NetworkIcons/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';
import { FormGroup, SelectOption } from '@patternfly/react-core';

type NetworkInterfaceLinkStateProps = {
  isDisabled: boolean;
  linkState: NetworkInterfaceState;
  setLinkState: Dispatch<SetStateAction<string>>;
};

const NetworkInterfaceLinkState: FC<NetworkInterfaceLinkStateProps> = ({
  isDisabled,
  linkState,
  setLinkState,
}) => {
  const { t } = useKubevirtTranslation();

  const handleChange = (event: MouseEvent<HTMLSelectElement>, value: string) => {
    event.preventDefault();
    setLinkState(value);
  };

  return (
    <FormGroup className="form-group-margin" fieldId="link-state" label={t('Link state')}>
      <div data-test-id="link-state-select">
        <FormPFSelect
          isDisabled={isDisabled}
          onSelect={handleChange}
          selected={isDisabled ? undefined : linkState}
          selectedLabel={isDisabled ? undefined : linkState && describeNetworkState(t, linkState)}
          toggleProps={{ isFullWidth: true }}
        >
          {[NetworkInterfaceState.DOWN, NetworkInterfaceState.UP].map((state) => (
            <SelectOption data-test-id={`link-state-select-${state}`} key={state} value={state}>
              {describeNetworkState(t, state)}
            </SelectOption>
          ))}
        </FormPFSelect>
      </div>
    </FormGroup>
  );
};

export default NetworkInterfaceLinkState;
