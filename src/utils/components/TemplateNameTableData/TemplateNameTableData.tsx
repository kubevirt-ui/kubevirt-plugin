import * as React from 'react';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import './template-name-table-data.scss';

type TemplateNameTableDataProps = {
  name: string;
};

const TemplateNameTableData: React.FC<TemplateNameTableDataProps> = ({ name, children }) => {
  const { t } = useKubevirtTranslation();
  return (
    <div className="template-name-table-data">
      {children || name}
      {!!/^\$\{[A-Z_]+\}$/.test(name) && (
        <div className="template-parameter">{t('template parameter')}</div>
      )}
    </div>
  );
};

export default TemplateNameTableData;
