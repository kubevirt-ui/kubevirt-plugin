import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
} from '@patternfly/react-core';

type DeleteAllVMsConfirmationProps = {
  confirmationValue: string;
  numVMs: number;
  setConfirmationValue: (value: string) => void;
};

const DeleteAllVMsConfirmation: FC<DeleteAllVMsConfirmationProps> = ({
  confirmationValue,
  numVMs,
  setConfirmationValue,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Form>
      <FormGroup fieldId="delete-all-vms-confirmation" label={t('Confirm deletion')}>
        <TextInput
          id="delete-all-vms-confirmation"
          onChange={(_event, value) => setConfirmationValue(value)}
          type="text"
          value={confirmationValue}
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              <strong>{numVMs}</strong>{' '}
              {t('VirtualMachines will be deleted. Type this number to confirm.')}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
    </Form>
  );
};

export default DeleteAllVMsConfirmation;
