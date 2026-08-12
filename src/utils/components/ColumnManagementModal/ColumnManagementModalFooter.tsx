import React, { type FC, type MouseEventHandler } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Flex,
  ModalFooter,
  Stack,
} from '@patternfly/react-core';

type ColumnManagementModalFooterProps = {
  error: Error | null;
  loaded: boolean;
  onClose: () => void;
  resetColumns: (event: React.SyntheticEvent) => void;
  submit: MouseEventHandler<HTMLButtonElement>;
};

const ColumnManagementModalFooter: FC<ColumnManagementModalFooterProps> = ({
  error,
  loaded,
  onClose,
  resetColumns,
  submit,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <ModalFooter>
      <Stack className="kv-tabmodal-footer" hasGutter>
        {error && (
          <Alert isInline title={t('An error occurred')} variant={AlertVariant.danger}>
            {error.message}
          </Alert>
        )}
        <Flex spaceItems={{ default: 'spaceItemsSm' }}>
          <Button
            data-test="save-button"
            form="modal-with-form-form"
            isDisabled={!loaded}
            isLoading={!loaded}
            key="create"
            onClick={submit}
            variant={ButtonVariant.primary}
          >
            {t('Save')}
          </Button>
          <Button
            data-test="reset-button"
            key="reset"
            onClick={resetColumns}
            variant={ButtonVariant.secondary}
          >
            {t('Restore default columns')}
          </Button>
          <Button data-test="cancel-button" onClick={onClose} variant={ButtonVariant.link}>
            {t('Cancel')}
          </Button>
        </Flex>
      </Stack>
    </ModalFooter>
  );
};

export default ColumnManagementModalFooter;
