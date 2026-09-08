import React, { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

type PVCClonePermissionAlertProps = {
  sourceNamespace: string;
};

const PVCClonePermissionAlert: FC<PVCClonePermissionAlertProps> = ({ sourceNamespace }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Alert
      className="pf-v6-u-mt-sm"
      isInline
      title={t('An error occurred')}
      variant={AlertVariant.danger}
    >
      {t('You do not have permission to clone volumes from project {{namespace}}.', {
        namespace: sourceNamespace,
      })}
    </Alert>
  );
};

export default PVCClonePermissionAlert;
