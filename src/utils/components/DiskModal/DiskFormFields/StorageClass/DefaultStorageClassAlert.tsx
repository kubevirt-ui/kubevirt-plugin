import React, { FC } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

const DefaultStorageClassAlert: FC = () => (
  <Alert
    title={t("Selected StorageClass is different from StorageClass of the template's boot source")}
    isInline
    variant={AlertVariant.info}
  >
    {t('It may take several minutes until the clone is done and the VirtualMachine is ready.')}
  </Alert>
);

export default DefaultStorageClassAlert;
