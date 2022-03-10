import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant, FormGroup } from '@patternfly/react-core';

type CreateErrorAlertProps = {
  createSnapshotError: any;
};

const CreateErrorAlert: React.FC<CreateErrorAlertProps> = ({ createSnapshotError }) => {
  const { t } = useKubevirtTranslation();
  if (!createSnapshotError) {
    return null;
  }
  return (
    <FormGroup fieldId="snapshot-create-error-alert">
      <Alert variant={AlertVariant.danger} isInline title={t('Create snapshot failed')}>
        {createSnapshotError}
      </Alert>
    </FormGroup>
  );
};

export default CreateErrorAlert;
