import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

const AlertScripts: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Alert
      title={t(
        'Cloud-init and SSH key configurations will be applied to the VirtualMachine only at the first boot.',
      )}
      className="scripts-alert"
      isInline
      variant={AlertVariant.warning}
    >
      {t('You must ensure that the configuration is correct before starting the VirtualMachine.')}
    </Alert>
  );
};

export default AlertScripts;
