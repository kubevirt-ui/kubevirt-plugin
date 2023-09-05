import React, { FC, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { clearSessionStorageVM } from '@catalog/utils/WizardVMContext';
import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
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

export const FormActionGroup: FC<FormActionGroupProps> = ({ loading, onCancel }) => {
  const { t } = useKubevirtTranslation();
  const { ns: namespace } = useParams<{ ns: string }>();
  const history = useHistory();

  const handleCancel = useCallback(() => {
    const namespaceUrl = namespace ? `ns/${namespace}` : ALL_NAMESPACES;
    onCancel?.().catch(kubevirtConsole.error);
    clearSessionStorageVM();
    history.push(`/k8s/${namespaceUrl}/templatescatalog`);
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
