import { type FC, type MouseEventHandler } from 'react';

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
  submit: MouseEventHandler<HTMLButtonElement>;
};

const ColumnManagementModalFooter: FC<ColumnManagementModalFooterProps> = ({
  error,
  loaded,
  onClose,
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
            isDisabled={!loaded}
            isLoading={!loaded}
            onClick={submit}
            variant={ButtonVariant.primary}
          >
            {t('Save')}
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
