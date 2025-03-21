import React, { Dispatch, FC, MouseEvent, SetStateAction } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { NetworkInterfaceState } from '@kubevirt-utils/components/NetworkInterfaceModal/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, SelectOption } from '@patternfly/react-core';

import './NetworkInterfaceLinkState.scss';

type NetworkInterfaceLinkStateProps = {
  isDisabled: boolean;
  linkState: string;
  setLinkState: Dispatch<SetStateAction<string>>;
};

const NetworkInterfaceLinkState: FC<NetworkInterfaceLinkStateProps> = ({
  isDisabled,
  linkState,
  setLinkState,
}) => {
  const { t } = useKubevirtTranslation();

  const linkStateOptions = {
    down: {
      id: NetworkInterfaceState.DOWN,
      name: t('Down'),
    },
    up: {
      id: NetworkInterfaceState.UP,
      name: t('Up'),
    },
  };

  const handleChange = (event: MouseEvent<HTMLSelectElement>, value: string) => {
    event.preventDefault();
    setLinkState(value);
  };

  return (
    <FormGroup className="link-state" fieldId="link-state" label={t('Link state')}>
      <div data-test-id="link-state-select">
        <FormPFSelect
          isDisabled={isDisabled}
          onSelect={handleChange}
          selected={linkState}
          selectedLabel={linkState && linkStateOptions[linkState].name}
          toggleProps={{ isFullWidth: true }}
        >
          {Object.values(linkStateOptions)?.map(({ id, name }) => (
            <SelectOption data-test-id={`link-state-select-${id}`} key={id} value={id}>
              {name}
            </SelectOption>
          ))}
        </FormPFSelect>
      </div>
    </FormGroup>
  );
};

export default NetworkInterfaceLinkState;
