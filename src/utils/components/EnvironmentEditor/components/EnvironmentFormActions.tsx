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

import './EnvironmentFormActions.scss';

type EnvironmentFormActionsProps = {
  closeError: () => void;
  error?: any;
  isSaveDisabled?: boolean;
  onReload: () => void;
  onSave: () => void;
};

const EnvironmentFormActions: React.FC<EnvironmentFormActionsProps> = ({
  closeError,
  error,
  isSaveDisabled,
  onReload,
  onSave,
}) => {
  const { t } = useKubevirtTranslation();
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState<any>();

  const onSubmit = async () => {
    setLoading(true);
    try {
      await onSave();
      setSuccess(true);
      setApiError(undefined);
    } catch (onSaveError) {
      setApiError(onSaveError);
    } finally {
      setLoading(false);
    }
  };

  const closeAlert = () => {
    if (apiError) {
      setApiError(undefined);
    } else {
      closeError();
    }
  };

  return (
    <Stack className="environment-form__buttons">
      <StackItem>
        {(error || apiError) && (
          <Alert
            actionClose={<AlertActionCloseButton onClose={closeAlert} />}
            className="co-alert co-alert--scrollable"
            isInline
            title={t('An error occurred')}
            variant="danger"
          >
            <div className="co-pre-line">{error?.message || apiError?.message}</div>
          </Alert>
        )}
        {success && (
          <Alert
            actionClose={<AlertActionCloseButton onClose={() => setSuccess(false)} />}
            className="co-alert"
            isInline
            title={t('Success')}
            variant="success"
          />
        )}
      </StackItem>
      <StackItem>
        <ActionGroup className="pf-c-form">
          <Button
            isDisabled={isSaveDisabled || loading}
            isLoading={loading}
            onClick={onSubmit}
            type="submit"
            variant="primary"
          >
            {t('Save')}
          </Button>
          <Button onClick={onReload} type="button" variant="secondary">
            {t('Reload')}
          </Button>
        </ActionGroup>
      </StackItem>
    </Stack>
  );
};

export default EnvironmentFormActions;
