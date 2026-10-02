import type { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

type PVCClonePermissionAlertProps = {
  className?: string;
  sourceNamespace: string;
};

const PVCClonePermissionAlert: FC<PVCClonePermissionAlertProps> = ({
  className,
  sourceNamespace,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Alert
      className={className}
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
