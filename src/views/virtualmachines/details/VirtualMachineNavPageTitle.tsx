import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label, Title } from '@patternfly/react-core';

import VirtualMachineActions from '../list/components/VirtualMachineActions/VirtualMachineActions';
import { getVMStatusIcon } from '../utils';

type VirtualMachineNavPageTitleProps = {
  vm: V1VirtualMachine;
};

const VirtualMachineNavPageTitle: React.FC<VirtualMachineNavPageTitleProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const StatusIcon = getVMStatusIcon(vm?.status?.printableStatus);
  return (
    <div className="co-m-nav-title co-m-nav-title--detail">
      <Title className="co-m-pane__heading" headingLevel="h1">
        <span className="co-resource-item__resource-name">
          <span className="co-m-resource-icon co-m-resource-icon--lg">{t('VM')}</span>
          <span className="co-resource-item__resource-name">
            {vm?.metadata?.name}{' '}
            <Label isCompact icon={<StatusIcon />}>
              {vm?.status?.printableStatus}
            </Label>
          </span>
        </span>
        <VirtualMachineActions vm={vm} />
      </Title>
    </div>
  );
};

export default VirtualMachineNavPageTitle;
