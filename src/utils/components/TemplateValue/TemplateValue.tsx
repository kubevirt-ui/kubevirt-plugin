import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isTemplateParameter } from '@kubevirt-utils/utils/utils';

import './template-value.scss';

type TemplateNameTableDataProps = {
  isNIC?: boolean;
  value: string;
};

const TemplateNameTableData: React.FC<TemplateNameTableDataProps> = ({
  children,
  isNIC,
  value,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <span className="template-value">
      {children || value}
      {isNIC && t(' (NIC)')}
      {isTemplateParameter(value) && (
        <div className="template-parameter">{t('Template parameter')}</div>
      )}
    </span>
  );
};

export default TemplateNameTableData;
