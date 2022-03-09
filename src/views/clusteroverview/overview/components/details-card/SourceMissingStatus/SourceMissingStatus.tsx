import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import WarningStatus from './WarningStatus';

const SourceMissingStatus: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <WarningStatus title={t('Cannot update')} />
      <span className="text-muted">{t('CatalogSource not found')}</span>
    </>
  );
};

export default SourceMissingStatus;
