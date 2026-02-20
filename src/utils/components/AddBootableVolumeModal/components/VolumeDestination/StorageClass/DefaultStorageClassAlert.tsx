import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

const DefaultStorageClassAlert: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Alert
      isInline
      title={t('Selected StorageClass is different from StorageClass of the source')}
      variant={AlertVariant.info}
    >
      {t('It may take several minutes until the clone is done and the VirtualMachine is ready.')}
    </Alert>
  );
};

export default DefaultStorageClassAlert;
