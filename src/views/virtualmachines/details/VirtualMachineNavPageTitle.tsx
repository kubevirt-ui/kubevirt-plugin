import React, { FC } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DetailsPageTitle from '@kubevirt-utils/components/DetailsPageTitle/DetailsPageTitle';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import useVirtualMachineInstanceMigration from '@kubevirt-utils/resources/vmi/hooks/useVirtualMachineInstanceMigration';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { Label, Split, SplitItem, Title } from '@patternfly/react-core';
import VirtualMachineActions from '@virtualmachines/actions/components/VirtualMachineActions/VirtualMachineActions';
import FailedMigrationAlert from '@virtualmachines/actions/components/VirtualMachineComputeMigration/components/FailedMigrationAlert/FailedMigrationAlert';
import VMActionsIconBar from '@virtualmachines/actions/components/VMActionsIconBar/VMActionsIconBar';
import useVirtualMachineActionsProvider from '@virtualmachines/actions/hooks/useVirtualMachineActionsProvider';
import VirtualMachinePendingChangesAlert from '@virtualmachines/details/VirtualMachinePendingChangesAlert/VirtualMachinePendingChangesAlert';
import VMNotMigratableLabel from '@virtualmachines/list/components/VMNotMigratableLabel/VMNotMigratableLabel';

import VirtualMachineBreadcrumb from '../list/components/VirtualMachineBreadcrumb/VirtualMachineBreadcrumb';
import { getVMStatusIcon, isRunning } from '../utils';

import { vmTabsWithYAML } from './utils/constants';

type VirtualMachineNavPageTitleProps = {
  instanceTypeExpandedSpec: V1VirtualMachine;
  isLoaded?: boolean;
  vm: V1VirtualMachine;
};

const VirtualMachineNavPageTitle: FC<VirtualMachineNavPageTitleProps> = ({
  instanceTypeExpandedSpec,
  isLoaded,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const location = useLocation();

  const name = getName(vm);
  const namespace = getNamespace(vm);
  const cluster = useClusterParam();

  const { vmi } = useVMI(name, namespace, cluster, isRunning(vm));
  const vmim = useVirtualMachineInstanceMigration(vm);
  const [actions] = useVirtualMachineActionsProvider(vm, vmim);
  const StatusIcon = getVMStatusIcon(vm?.status?.printableStatus);

  const isSidebarEditorDisplayed = vmTabsWithYAML.find((tab) =>
    location.pathname.includes(`/${name}/${tab}`),
  );

  return (
    <DetailsPageTitle
      breadcrumb={<VirtualMachineBreadcrumb cluster={cluster} namespace={namespace} />}
    >
      <PaneHeading>
        <Title headingLevel="h1">
          <Split hasGutter>
            <SplitItem>
              <span className="co-m-resource-icon co-m-resource-icon--lg">{t('VM')}</span>
              <span>{name} </span>
              {!isEmpty(vm) && (
                <Label className="vm-resource-label" icon={<StatusIcon />} isCompact>
                  {vm?.status?.printableStatus}
                </Label>
              )}
              <VMNotMigratableLabel vm={vm} />
            </SplitItem>
          </Split>
        </Title>
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
      </PaneHeading>
      <VirtualMachinePendingChangesAlert
        instanceTypeExpandedSpec={instanceTypeExpandedSpec}
        vm={vm}
        vmi={vmi}
      />
      <FailedMigrationAlert vm={vm} vmim={vmim} />
    </DetailsPageTitle>
  );
};

export default VirtualMachineNavPageTitle;
