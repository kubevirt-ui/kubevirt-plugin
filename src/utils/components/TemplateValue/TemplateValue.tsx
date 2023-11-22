import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isTemplateParameter } from '@kubevirt-utils/utils/utils';

import './template-value.scss';

type TemplateNameTableDataProps = {
  value: string;
};

const TemplateNameTableData: React.FC<TemplateNameTableDataProps> = ({ children, value }) => {
  const { t } = useKubevirtTranslation();
  return (
    <div className="template-value">
      {children || value}
      {isTemplateParameter(value) && (
        <div className="template-parameter">{t('Template parameter')}</div>
      )}
    </div>
  );
};

export default TemplateNameTableData;
