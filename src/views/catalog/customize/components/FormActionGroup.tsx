import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ActionGroup, Button } from '@patternfly/react-core';

type FormActionGroupProps = {
  loading: boolean;
};

export const FormActionGroup: React.FC<FormActionGroupProps> = ({ loading }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  const goBack = React.useCallback(() => {
    history.goBack();
  }, [history]);

  return (
    <ActionGroup>
      <Button
        variant="primary"
        type="submit"
        isDisabled={loading}
        isLoading={loading}
        data-test-id="customize-vm-submit-button"
      >
        {t('Review and create VirtualMachine')}
      </Button>
      <Button variant="link" onClick={goBack}>
        {t('Cancel')}
      </Button>
    </ActionGroup>
  );
};
