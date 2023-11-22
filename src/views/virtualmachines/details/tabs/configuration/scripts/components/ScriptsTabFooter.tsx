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
  onReload: () => void;
  onSave: () => Promise<void>;
};

const ScriptsTabFooter: React.FC<ScriptsTabFooterProps> = ({
  isSaveDisabled,
  onReload,
  onSave,
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
    <Stack className="vm-scripts-tab__buttons">
      <StackItem>
        {apiError && (
          <Alert
            actionClose={<AlertActionCloseButton onClose={_closeError} />}
            className="co-alert co-alert--scrollable"
            isInline
            title={t('An error occurred')}
            variant="danger"
          >
            <div className="co-pre-line">{apiError?.message}</div>
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
            isDisabled={isSaveDisabled}
            isLoading={loading}
            onClick={_onSave}
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

export default ScriptsTabFooter;
