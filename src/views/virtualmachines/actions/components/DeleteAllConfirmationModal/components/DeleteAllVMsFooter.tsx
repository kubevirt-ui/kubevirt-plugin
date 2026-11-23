import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  ModalFooter,
  Stack,
  StackItem,
  Tooltip,
} from '@patternfly/react-core';

type DeleteAllVMsFooterProps = {
  error: Error | undefined;
  handleClose: () => void;
  isConfirmed: boolean;
  isSubmitting: boolean;
  numVMs: number;
  submitHandler: () => void;
};

const DeleteAllVMsFooter: FC<DeleteAllVMsFooterProps> = ({
  error,
  handleClose,
  isConfirmed,
  isSubmitting,
  numVMs,
  submitHandler,
}) => {
  const { t } = useKubevirtTranslation();

  const deleteButton = (
    <Button
      isAriaDisabled={!isConfirmed || isSubmitting}
      isLoading={isSubmitting}
      key="confirm"
      onClick={submitHandler}
      variant={ButtonVariant.danger}
    >
      {t('Delete {{count}} VirtualMachines', { count: numVMs })}
    </Button>
  );

  return (
    <ModalFooter>
      <Stack hasGutter>
        {error && (
          <StackItem>
            <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
              {error.message}
            </Alert>
          </StackItem>
        )}
        <StackItem>
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <FlexItem>
              {!isConfirmed ? (
                <Tooltip
                  content={t('Before you can delete, you must confirm the number of VMs')}
                  position="right"
                >
                  {deleteButton}
                </Tooltip>
              ) : (
                deleteButton
              )}
            </FlexItem>
            <FlexItem>
              <Button key="cancel" onClick={handleClose} variant={ButtonVariant.link}>
                {t('Cancel')}
              </Button>
            </FlexItem>
          </Flex>
        </StackItem>
      </Stack>
    </ModalFooter>
  );
};

export default DeleteAllVMsFooter;
