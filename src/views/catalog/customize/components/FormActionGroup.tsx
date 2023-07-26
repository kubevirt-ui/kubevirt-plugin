import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { clearSessionStorageVM } from '@catalog/utils/WizardVMContext';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ActionGroup, Button } from '@patternfly/react-core';

type FormActionGroupProps = {
  loading: boolean;
  onCancel?: () => Promise<{
    metadata: {
      name: string;
      namespace: string;
    };
  }>;
};

export const FormActionGroup: React.FC<FormActionGroupProps> = ({ loading, onCancel }) => {
  const { t } = useKubevirtTranslation();
  const { ns: namespace } = useParams<{ ns: string }>();
  const history = useHistory();

  const handleCancel = React.useCallback(() => {
    onCancel?.().catch(console.error);
    clearSessionStorageVM();
    history.push(`/k8s/ns/${namespace}/templatescatalog`);
  }, [history, namespace, onCancel]);

  return (
    <ActionGroup>
      <Button
        data-test-id="customize-vm-submit-button"
        isDisabled={loading}
        isLoading={loading}
        type="submit"
        variant="primary"
      >
        {t('Customize VirtualMachine parameters')}
      </Button>
      <Button onClick={handleCancel} variant="link">
        {t('Cancel')}
      </Button>
    </ActionGroup>
  );
};
