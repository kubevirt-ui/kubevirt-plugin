import React, { FC } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useSingleNodeCluster from '@kubevirt-utils/hooks/useSingleNodeCluster';
import useVirtualMachineInstanceMigration from '@kubevirt-utils/resources/vmi/hooks/useVirtualMachineInstanceMigration';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Label, Split, SplitItem } from '@patternfly/react-core';
import VirtualMachineActions from '@virtualmachines/actions/components/VirtualMachineActions/VirtualMachineActions';
import VMActionsIconBar from '@virtualmachines/actions/components/VMActionsIconBar/VMActionsIconBar';
import useVirtualMachineActionsProvider from '@virtualmachines/actions/hooks/useVirtualMachineActionsProvider';
import VirtualMachinePendingChangesAlert from '@virtualmachines/details/VirtualMachinePendingChangesAlert/VirtualMachinePendingChangesAlert';
import VMNotMigratableLabel from '@virtualmachines/list/components/VMNotMigratableLabel/VMNotMigratableLabel';

import VirtualMachineBreadcrumb from '../list/components/VirtualMachineBreadcrumb/VirtualMachineBreadcrumb';
import { getVMStatusIcon } from '../utils';

import { vmTabsWithYAML } from './utils/constants';

type VirtualMachineNavPageTitleProps = {
  isLoaded?: boolean;
  name: string;
  nonExpandedVM: V1VirtualMachine;
  vm: V1VirtualMachine;
};

const VirtualMachineNavPageTitle: FC<VirtualMachineNavPageTitleProps> = ({
  isLoaded,
  name,
  nonExpandedVM,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const location = useLocation();

  const [vmi] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: false,
    name: vm?.metadata?.name,
    namespace: vm?.metadata?.namespace,
  });
  const vmim = useVirtualMachineInstanceMigration(vm);
  const [isSingleNodeCluster] = useSingleNodeCluster();
  const [actions] = useVirtualMachineActionsProvider(nonExpandedVM, vmim, isSingleNodeCluster);
  const StatusIcon = getVMStatusIcon(vm?.status?.printableStatus);

  const isSidebarEditorDisplayed = vmTabsWithYAML.find((tab) =>
    location.pathname.includes(`/${name}/${tab}`),
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
              {!isEmpty(vm) && (
                <Label className="vm-resource-label" icon={<StatusIcon />} isCompact>
                  {vm?.status?.printableStatus}
                </Label>
              )}
              <VMNotMigratableLabel vm={vm} />
            </SplitItem>
          </Split>
        </h1>
        <Split hasGutter>
          {isSidebarEditorDisplayed && (
            <SplitItem className="VirtualMachineNavPageTitle__SidebarEditorSwitch">
              <SidebarEditorSwitch />
            </SplitItem>
          )}
          {!isLoaded && <Loading />}
          {vm && isLoaded && (
            <>
              <VMActionsIconBar vm={vm} />
              <SplitItem>
                <VirtualMachineActions actions={actions} />
              </SplitItem>
            </>
          )}
        </Split>
      </span>
      <VirtualMachinePendingChangesAlert vm={vm} vmi={vmi} />
    </div>
  );
};

export default VirtualMachineNavPageTitle;
