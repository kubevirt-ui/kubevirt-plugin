import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { icon } from '@kubevirt-utils/resources/vmi';
import { Label } from '@patternfly/react-core';

import VirtualMachineInstanceActions from '../list/components/VirtualMachineInstanceActions/VirtualMachineInstanceAction';

type VirtualMachinesInstancePageHeaderProps = {
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinesInstancePageHeader: React.FC<VirtualMachinesInstancePageHeaderProps> = ({
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const status = vmi?.status?.phase;
  const IconComponent = icon?.[status];
  return (
    <div className="co-m-nav-title co-m-nav-title--detail">
      <span className={'co-m-pane__heading'}>
        <h1 className="co-m-pane__name co-resource-item">
          <span className={`co-m-resource-icon co-m-resource-icon--lg`}>{t('VMI')}</span>
          <span data-test-id="resource-title" className="co-resource-item__resource-name">
            {vmi?.metadata?.name}
            <Label isCompact icon={<IconComponent />}>
              {status}
            </Label>
          </span>
        </h1>
        <VirtualMachineInstanceActions vmi={vmi} />
      </span>
    </div>
  );
};

export default VirtualMachinesInstancePageHeader;
