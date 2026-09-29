import { type FC } from 'react';
import { Controller } from 'react-hook-form';

import { Button, InputGroup, InputGroupItem, TextInput } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';

import { useVMWizardForm } from '../form/VMWizardFormProvider';

const DescriptionInput: FC = () => {
  const { control } = useVMWizardForm();

  return (
    <InputGroup>
      <InputGroupItem isFill>
        <Controller
          control={control}
          name="deployment.description"
          render={({ field: { ref: _ref, ...field } }) => (
            <TextInput id="vm-description" type="text" {...field} />
          )}
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
