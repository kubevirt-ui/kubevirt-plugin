import { type FC, type ReactElement, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ActionGroup,
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Button,
  ButtonVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import './EnvironmentFormActions.scss';

type EnvironmentFormActionsProps = {
  closeError: () => void;
  error?: Error | undefined;
  isSaveDisabled?: boolean;
  onReload: () => void;
  onSave: () => Promise<unknown>;
};

const EnvironmentFormActions: FC<EnvironmentFormActionsProps> = ({
  closeError,
  error,
  isSaveDisabled,
  onReload,
  onSave,
}): ReactElement => {
  const { t } = useKubevirtTranslation();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<Error | undefined>();

  const onSubmit = async (): Promise<void> => {
    setLoading(true);
    try {
      await onSave();
      setSuccess(true);
      setApiError(undefined);
    } catch (onSaveError) {
      setApiError(onSaveError instanceof Error ? onSaveError : new Error(String(onSaveError)));
    } finally {
      setLoading(false);
    }
  };

  const closeAlert = (): void => {
    if (apiError) {
      setApiError(undefined);
    } else {
      closeError();
    }
  };

  return (
    <Stack className="environment-form__buttons">
      <StackItem>
        {(error ?? apiError) && (
          <Alert
            actionClose={<AlertActionCloseButton onClose={closeAlert} />}
            className="co-alert--scrollable"
            isInline
            title={t('An error occurred')}
            variant={AlertVariant.danger}
          >
            <div className="co-pre-line">{error?.message ?? apiError?.message}</div>
          </Alert>
        )}
        {success && (
          <Alert
            actionClose={<AlertActionCloseButton onClose={() => setSuccess(false)} />}
            className="pf-v6-u-mb-md"
            isInline
            title={t('Success')}
            variant={AlertVariant.success}
          />
        )}
      </StackItem>
      <StackItem>
        <ActionGroup className="pf-v6-c-form">
          <Button
            data-test="save-button"
            isDisabled={isSaveDisabled || loading}
            isLoading={loading}
            onClick={onSubmit}
            type="submit"
          >
            {t('Save')}
          </Button>
          <Button onClick={onReload} type="button" variant={ButtonVariant.secondary}>
            {t('Reload')}
          </Button>
        </ActionGroup>
      </StackItem>
    </Stack>
  );
};

export default EnvironmentFormActions;
