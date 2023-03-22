import React, { FC } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

const DefaultStorageClassAlert: FC = () => (
  <Alert
    title={t('Selected StorageClass is different from the default StorageClass')}
    isInline
    variant={AlertVariant.info}
  >
    {t('This StorageClass might cause slower cloning.')}
  </Alert>
);

export default DefaultStorageClassAlert;
