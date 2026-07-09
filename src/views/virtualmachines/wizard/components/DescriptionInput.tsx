import React, { FC } from 'react';
import { Controller } from 'react-hook-form';

import { Button, InputGroup, InputGroupItem, TextInput } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';

import { useVMWizard } from '../state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '../state/vm-wizard-form/consts';

const DescriptionInput: FC = () => {
  const { control } = useVMWizard();

  return (
    <InputGroup>
      <InputGroupItem isFill>
        <Controller
          render={({ field: { ref: _, ...field } }) => (
            <TextInput id="vm-description" type="text" {...field} />
          )}
          control={control}
          name={CREATE_VM_FORM_FIELDS_VM_DATA.DESCRIPTION}
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
