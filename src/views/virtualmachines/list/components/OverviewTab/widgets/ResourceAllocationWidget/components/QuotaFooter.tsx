import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type QuotaFooterProps = {
  display: string;
  icon?: React.ReactNode;
};

const QuotaFooter: FC<QuotaFooterProps> = ({ display, icon }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="resource-allocation-widget__quota">
      {icon}
      <span className="resource-allocation-widget__quota-title">{t('Quota')}</span>
      <span className="resource-allocation-widget__quota-value">{display}</span>
    </div>
  );
};

export default QuotaFooter;
