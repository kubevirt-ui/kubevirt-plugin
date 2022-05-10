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

type ScriptsTabFooterProps = {
  isSaveDisabled?: boolean;
  onSave: () => Promise<void>;
  onReload: () => void;
};

const ScriptsTabFooter: React.FC<ScriptsTabFooterProps> = ({
  isSaveDisabled,
  onSave,
  onReload,
}) => {
  const { t } = useKubevirtTranslation();
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState<any>();

  const _onSave = async () => {
    setSuccess(false);
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

  const _closeError = () => {
    setApiError(undefined);
  };

  return (
    <Stack className="vm-environment-tab__buttons">
      <StackItem>
        {apiError && (
          <Alert
            isInline
            className="co-alert co-alert--scrollable"
            variant="danger"
            title={t('An error occurred')}
            actionClose={<AlertActionCloseButton onClose={_closeError} />}
          >
            <div className="co-pre-line">{apiError?.message}</div>
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
          <Button
            isDisabled={isSaveDisabled}
            type="submit"
            variant="primary"
            onClick={_onSave}
            isLoading={loading}
          >
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

export default ScriptsTabFooter;
