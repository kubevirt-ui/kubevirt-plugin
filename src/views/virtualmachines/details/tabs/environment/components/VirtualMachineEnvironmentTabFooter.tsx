import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ActionGroup,
  Alert,
  AlertActionCloseButton,
  Button,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import './VirtualMachineEnvironmentTabFooter.scss';

type VirtualMachineEnvironmentTabFooterProps = {
  error?: any;
  isSaveDisabled?: boolean;
  closeError: () => void;
  onSave: () => void;
  onReload: () => void;
};

const VirtualMachineEnvironmentTabFooter: React.FC<VirtualMachineEnvironmentTabFooterProps> = ({
  error,
  isSaveDisabled,
  onSave,
  onReload,
  closeError,
}) => {
  const { t } = useKubevirtTranslation();
  const [success, setSuccess] = React.useState(false);
  const [apiError, setApiError] = React.useState<any>();

  const _onSave = async () => {
    try {
      await onSave();
      setSuccess(true);
      setApiError(undefined);
    } catch (onSaveError) {
      setApiError(onSaveError);
    }
  };

  const _closeError = () => {
    if (apiError) {
      setApiError(undefined);
    } else {
      closeError();
    }
  };

  return (
    <Stack className="vm-environment-tab__buttons">
      <StackItem>
        {(error || apiError) && (
          <Alert
            isInline
            className="co-alert co-alert--scrollable"
            variant="danger"
            title={t('An error occurred')}
            actionClose={<AlertActionCloseButton onClose={_closeError} />}
          >
            <div className="co-pre-line">{error?.message || apiError?.message}</div>
          </Alert>
        )}
        {success && (
          <Alert
            isInline
            className="co-alert"
            variant="success"
            title={t('Success')}
            actionClose={<AlertActionCloseButton onClose={() => setSuccess(false)} />}
          />
        )}
      </StackItem>
      <StackItem>
        <ActionGroup className="pf-c-form">
          <Button isDisabled={isSaveDisabled} type="submit" variant="primary" onClick={_onSave}>
            {t('Save')}
          </Button>
          <Button type="button" variant="secondary" onClick={onReload}>
            {t('Reload')}
          </Button>
        </ActionGroup>
      </StackItem>
    </Stack>
  );
};

export default VirtualMachineEnvironmentTabFooter;
