import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  GenericStatus,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';

const SourceMissingStatus: React.FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <GenericStatus Icon={YellowExclamationTriangleIcon} title={t('Cannot update')} />
      <span className="text-muted">{t('CatalogSource not found')}</span>
    </>
  );
};

export default SourceMissingStatus;
