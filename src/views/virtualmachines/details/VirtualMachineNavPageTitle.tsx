import React, { FC } from 'react';

import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useSingleNodeCluster from '@kubevirt-utils/hooks/useSingleNodeCluster';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Label, Split, SplitItem } from '@patternfly/react-core';
import VirtualMachineActions from '@virtualmachines/actions/components/VirtualMachineActions/VirtualMachineActions';
import useVirtualMachineInstanceMigration from '@virtualmachines/actions/hooks/useVirtualMachineInstanceMigration';
import VMNotMigratableLabel from '@virtualmachines/list/components/VMNotMigratableLabel/VMNotMigratableLabel';

import VirtualMachineBreadcrumb from '../list/components/VirtualMachineBreadcrumb/VirtualMachineBreadcrumb';
import { getVMStatusIcon } from '../utils';

import { vmTabsWithYAML } from './utils/constants';
import VirtualMachinePendingChangesAlert from './VirtualMachinePendingChangesAlert';

type VirtualMachineNavPageTitleProps = {
  vm: V1VirtualMachine;
  name: string;
};

const VirtualMachineNavPageTitle: FC<VirtualMachineNavPageTitleProps> = ({ vm, name }) => {
  const { t } = useKubevirtTranslation();

  const [vmi] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    name: vm?.metadata?.name,
    namespace: vm?.metadata?.namespace,
    isList: false,
  });
  const vmim = useVirtualMachineInstanceMigration(vm);
  const [isSingleNodeCluster] = useSingleNodeCluster();

  const StatusIcon = getVMStatusIcon(vm?.status?.printableStatus);

  const isSidebarEditorDisplayed = vmTabsWithYAML.find((tab) =>
    window.location.pathname.includes(`/${name}/${tab}`),
  );

  return (
    <div className="co-m-nav-title co-m-nav-title--detail">
      <VirtualMachineBreadcrumb />
      <span className="co-m-pane__heading">
        <h1 className="co-resource-item__resource-name">
          <Split hasGutter>
            <SplitItem>
              <span className="co-m-resource-icon co-m-resource-icon--lg">{t('VM')}</span>
              {name}{' '}
              <Label isCompact icon={<StatusIcon />} className="vm-resource-label">
                {vm?.status?.printableStatus}
              </Label>
            </SplitItem>
            <VMNotMigratableLabel vm={vm} />
          </Split>
        </h1>
        <Split hasGutter>
          {isSidebarEditorDisplayed && (
            <SplitItem className="VirtualMachineNavPageTitle__SidebarEditorSwitch">
              <SidebarEditorSwitch />
            </SplitItem>
          )}
          <SplitItem>
            <VirtualMachineActions vm={vm} vmim={vmim} isSingleNodeCluster={isSingleNodeCluster} />
          </SplitItem>
        </Split>
      </span>
      <VirtualMachinePendingChangesAlert vm={vm} vmi={vmi} />
    </div>
  );
};

export default VirtualMachineNavPageTitle;
