import * as React from 'react';

import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';

import VirtualMachineActions from '../list/components/VirtualMachineActions/VirtualMachineActions';
import VirtualMachineBreadcrumb from '../list/components/VirtualMachineBreadcrumb/VirtualMachineBreadcrumb';
import { getVMStatusIcon } from '../utils';

import VirtualMachinePendingChangesAlert from './VirtualMachinePendingChangesAlert';

type VirtualMachineNavPageTitleProps = {
  vm: V1VirtualMachine;
  name: string;
};

const VirtualMachineNavPageTitle: React.FC<VirtualMachineNavPageTitleProps> = ({ vm, name }) => {
  const { t } = useKubevirtTranslation();

  const [vmi] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    name: vm?.metadata?.name,
    namespace: vm?.metadata?.namespace,
    isList: false,
  });
  const StatusIcon = getVMStatusIcon(vm?.status?.printableStatus);
  return (
    <div className="co-m-nav-title co-m-nav-title--detail">
      <VirtualMachineBreadcrumb />
      <span className="co-m-pane__heading">
        <h1 className="co-resource-item__resource-name">
          <span className="co-m-resource-icon co-m-resource-icon--lg">{t('VM')}</span>
          {name}{' '}
          <Label isCompact icon={<StatusIcon />}>
            {vm?.status?.printableStatus}
          </Label>
        </h1>
        <VirtualMachineActions vm={vm} />
      </span>
      <VirtualMachinePendingChangesAlert vm={vm} vmi={vmi} />
    </div>
  );
};

export default VirtualMachineNavPageTitle;
