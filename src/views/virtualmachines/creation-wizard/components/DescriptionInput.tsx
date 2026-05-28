import React, { FC, FormEvent } from 'react';

import { Button, InputGroup, InputGroupItem, TextInput } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';

const DescriptionInput: FC = () => {
  const { setVMDescription, vmDescription } = useVMWizardStore();

  return (
    <InputGroup>
      <InputGroupItem isFill>
        <TextInput
          id="vm-description"
          onChange={(_event: FormEvent<HTMLInputElement>, value: string) => setVMDescription(value)}
          type="text"
          value={vmDescription}
        />
      </InputGroupItem>
      <InputGroupItem style={{ visibility: 'hidden' }}>
        <Button isDisabled variant="plain">
          <SyncAltIcon />
        </Button>
      </InputGroupItem>
    </InputGroup>
  );
};

export default DescriptionInput;
