import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type VirtualMachinesInstancePageHeaderProps = {
  name: string;
};

const VirtualMachinesInstancePageHeader: React.FC<VirtualMachinesInstancePageHeaderProps> = ({
  name,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="co-m-nav-title co-m-nav-title--detail">
      <h1 className={'co-m-pane__heading'}>
        <div className="co-m-pane__name co-resource-item">
          <span className={`co-m-resource-icon co-m-resource-icon--lg`}>{t('VMI')}</span>
          <span data-test-id="resource-title" className="co-resource-item__resource-name">
            {name}
          </span>
        </div>
      </h1>
    </div>
  );
};

export default VirtualMachinesInstancePageHeader;
