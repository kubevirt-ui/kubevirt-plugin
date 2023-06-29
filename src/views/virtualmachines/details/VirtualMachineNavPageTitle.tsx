import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';

import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useSingleNodeCluster from '@kubevirt-utils/hooks/useSingleNodeCluster';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Label, Split, SplitItem } from '@patternfly/react-core';
import VirtualMachineActions from '@virtualmachines/actions/components/VirtualMachineActions/VirtualMachineActions';
import useVirtualMachineActionsProvider from '@virtualmachines/actions/hooks/useVirtualMachineActionsProvider';
import useVirtualMachineInstanceMigration from '@virtualmachines/actions/hooks/useVirtualMachineInstanceMigration';
import VMNotMigratableLabel from '@virtualmachines/list/components/VMNotMigratableLabel/VMNotMigratableLabel';

import VirtualMachineBreadcrumb from '../list/components/VirtualMachineBreadcrumb/VirtualMachineBreadcrumb';
import { getVMStatusIcon } from '../utils';

import { vmTabsWithYAML } from './utils/constants';
import VirtualMachinePendingChangesAlert from './VirtualMachinePendingChangesAlert';

type VirtualMachineNavPageTitleProps = {
  name: string;
  vm: V1VirtualMachine;
};

const VirtualMachineNavPageTitle: FC<VirtualMachineNavPageTitleProps> = ({ name, vm }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  const [vmi] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: false,
    name: vm?.metadata?.name,
    namespace: vm?.metadata?.namespace,
  });
  const vmim = useVirtualMachineInstanceMigration(vm);
  const [isSingleNodeCluster] = useSingleNodeCluster();
  const [actions] = useVirtualMachineActionsProvider(vm, vmim, isSingleNodeCluster);

  const StatusIcon = getVMStatusIcon(vm?.status?.printableStatus);

  const isSidebarEditorDisplayed = vmTabsWithYAML.find((tab) =>
    history.location.pathname.includes(`/${name}/${tab}`),
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
              <Label className="vm-resource-label" icon={<StatusIcon />} isCompact>
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
          {!isEmpty(vm) ? (
            <SplitItem>
              <VirtualMachineActions actions={actions} />
            </SplitItem>
          ) : (
            <Loading />
          )}
        </Split>
      </span>
      <VirtualMachinePendingChangesAlert vm={vm} vmi={vmi} />
    </div>
  );
};

export default VirtualMachineNavPageTitle;
