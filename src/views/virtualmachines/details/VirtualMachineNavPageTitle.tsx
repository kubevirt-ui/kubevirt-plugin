import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label } from '@patternfly/react-core';

import VirtualMachineActions from '../list/components/VirtualMachineActions/VirtualMachineActions';
import VirtualMachineBreadcrumb from '../list/components/VirtualMachineBreadcrumb/VirtualMachineBreadcrumb';
import { getVMStatusIcon } from '../utils';

type VirtualMachineNavPageTitleProps = {
  vm: V1VirtualMachine;
  namespace: string;
};

const VirtualMachineNavPageTitle: React.FC<VirtualMachineNavPageTitleProps> = ({
  vm,
  namespace,
}) => {
  const { t } = useKubevirtTranslation();
  const StatusIcon = getVMStatusIcon(vm?.status?.printableStatus);
  return (
    <div className="co-m-nav-title co-m-nav-title--detail">
      <VirtualMachineBreadcrumb namespace={namespace} />
      <span className="co-m-pane__heading">
        <h1 className="co-resource-item__resource-name">
          <span className="co-m-resource-icon co-m-resource-icon--lg">{t('VM')}</span>
          {vm?.metadata?.name}{' '}
          <Label isCompact icon={<StatusIcon />}>
            {vm?.status?.printableStatus}
          </Label>
        </h1>
        <VirtualMachineActions vm={vm} />
      </span>
    </div>
  );
};

export default VirtualMachineNavPageTitle;
