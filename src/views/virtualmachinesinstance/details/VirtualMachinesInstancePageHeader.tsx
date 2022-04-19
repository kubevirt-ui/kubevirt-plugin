import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { icon } from '@kubevirt-utils/resources/vmi';
import { Label } from '@patternfly/react-core';

type VirtualMachinesInstancePageHeaderProps = {
  name: string;
  status: string;
};

const VirtualMachinesInstancePageHeader: React.FC<VirtualMachinesInstancePageHeaderProps> = ({
  name,
  status,
}) => {
  const { t } = useKubevirtTranslation();
  const IconComponent = icon?.[status];
  return (
    <div className="co-m-nav-title co-m-nav-title--detail">
      <h1 className={'co-m-pane__heading'}>
        <div className="co-m-pane__name co-resource-item">
          <span className={`co-m-resource-icon co-m-resource-icon--lg`}>{t('VMI')}</span>
          <span data-test-id="resource-title" className="co-resource-item__resource-name">
            {name}
            <Label isCompact icon={<IconComponent />}>
              {status}
            </Label>
          </span>
        </div>
      </h1>
    </div>
  );
};

export default VirtualMachinesInstancePageHeader;
