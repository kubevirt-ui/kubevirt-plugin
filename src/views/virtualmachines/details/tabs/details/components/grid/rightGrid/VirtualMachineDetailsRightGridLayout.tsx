import * as React from 'react';
import produce from 'immer';
import { getBooleanText } from 'src/views/migrationpolicies/utils/utils';

import { NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { BootOrderModal } from '@kubevirt-utils/components/BootOrderModal/BootOrderModal';
import HardwareDevices from '@kubevirt-utils/components/HardwareDevices/HardwareDevices';
import HostnameModal from '@kubevirt-utils/components/HostnameModal/HostnameModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import SSHAccess from '@kubevirt-utils/components/SSHAccess/SSHAccess';
import useSSHService from '@kubevirt-utils/components/SSHAccess/useSSHService';
import WorkloadProfileModal from '@kubevirt-utils/components/WorkloadProfileModal/WorkloadProfileModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useSingleNodeCluster from '@kubevirt-utils/hooks/useSingleNodeCluster';
import { WORKLOADS, WORKLOADS_LABELS } from '@kubevirt-utils/resources/template';
import { getWorkload, VM_WORKLOAD_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { k8sUpdate, K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, GridItem } from '@patternfly/react-core';
import { isLiveMigratable } from '@virtualmachines/utils';

import VirtualMachineStatus from '../../../../../../list/components/VirtualMachineStatus/VirtualMachineStatus';
import { VirtualMachineDetailsRightGridLayoutPresentation } from '../../../utils/gridHelper';
import BootOrderSummary from '../../BootOrderSummary/BootOrderSummary';
import VirtualMachineDescriptionItem from '../../VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';

type VirtualMachineDetailsRightGridLayout = {
  vm: V1VirtualMachine;
  vmDetailsRightGridObj: VirtualMachineDetailsRightGridLayoutPresentation;
  vmi?: V1VirtualMachineInstance;
};

const VirtualMachineDetailsRightGridLayout: React.FC<VirtualMachineDetailsRightGridLayout> = ({
  vm,
  vmDetailsRightGridObj,
  vmi,
}) => {
  const [sshService, sshServiceLoaded] = useSSHService(vm);

  const [isSingleNodeCluster] = useSingleNodeCluster();

  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const hostname = vm?.spec?.template?.spec?.hostname;
  const vmName = vm?.metadata?.name;
  const [canGetNode] = useAccessReview({
    namespace: vmi?.metadata?.namespace,
    verb: 'get' as K8sVerb,
    resource: NodeModel.plural,
  });

  const onSubmit = React.useCallback(
    (obj: V1VirtualMachine) =>
      k8sUpdate({
        model: VirtualMachineModel,
        data: obj,
        ns: obj.metadata.namespace,
        name: obj.metadata.name,
      }),
    [],
  );

  const vmWorkload = getWorkload(vm);

  const updateWorkload = (newWorkload: WORKLOADS) => {
    if (vmWorkload === newWorkload) return Promise.resolve();

    const updateVM = produce(vm, (draftVM) => {
      if (!draftVM.spec.template.metadata?.annotations)
        draftVM.spec.template.metadata.annotations = {};

      draftVM.spec.template.metadata.annotations[VM_WORKLOAD_ANNOTATION] = newWorkload;
    });

    return k8sUpdate({
      model: VirtualMachineModel,
      data: updateVM,
      ns: updateVM?.metadata?.namespace,
      name: updateVM?.metadata?.name,
    });
  };

  const isMigratable = isLiveMigratable(vm, isSingleNodeCluster);

  return (
    <GridItem span={5}>
      <DescriptionList>
        <VirtualMachineDescriptionItem
          descriptionData={
            <VirtualMachineStatus
              printableStatus={vm?.status?.printableStatus}
              isMigratable={isMigratable}
            />
          }
          descriptionHeader={t('Status')}
          data-test-id={`${vm?.metadata?.name}-status`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={getBooleanText(isLiveMigratable(vm, isSingleNodeCluster))}
          descriptionHeader={t('Live migratable')}
          data-test-id={`${vm?.metadata?.name}-migratable`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.pod}
          descriptionHeader={t('Pod')}
          data-test-id={`${vm?.metadata?.name}-pod`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.vmi}
          descriptionHeader={t('VirtualMachineInstance')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={<BootOrderSummary vm={vm} />}
          descriptionHeader={t('Boot order')}
          isEdit
          onEditClick={() =>
            createModal((props) => (
              <BootOrderModal {...props} vm={vm} onSubmit={onSubmit} vmi={vmi} />
            ))
          }
          data-test-id={`${vm?.metadata?.name}-boot-order`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.ipAddress}
          descriptionHeader={t('IP address')}
          data-test-id={`${vm?.metadata?.name}-ip-address`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={hostname || vmName}
          descriptionHeader={t('Hostname')}
          isEdit
          data-test-id={`${vm?.metadata?.name}-hostname`}
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <HostnameModal
                vm={vm}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
                vmi={vmi}
              />
            ))
          }
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.timezone}
          descriptionHeader={t('Time zone')}
          data-test-id={`${vm?.metadata?.name}-timezone`}
        />
        {canGetNode && (
          <VirtualMachineDescriptionItem
            descriptionData={vmDetailsRightGridObj?.node}
            descriptionHeader={t('Node')}
          />
        )}
        <VirtualMachineDescriptionItem
          descriptionData={
            vmWorkload ? (
              WORKLOADS_LABELS[vmWorkload] || vmWorkload
            ) : (
              <MutedTextSpan text={t('Not available')} />
            )
          }
          isEdit
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <WorkloadProfileModal
                initialWorkload={vmWorkload}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={updateWorkload}
              />
            ))
          }
          descriptionHeader={t('Workload profile')}
          data-test-id={`${vm?.metadata?.name}-workload-profile`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={
            <SSHAccess
              sshService={sshService}
              vmi={vmi}
              sshServiceLoaded={sshServiceLoaded}
              vm={vm}
            />
          }
          descriptionHeader={t('SSH access')}
          data-test-id={`${vm?.metadata?.name}-ssh-access`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={<HardwareDevices vm={vm} canEdit onSubmit={onSubmit} vmi={vmi} />}
          descriptionHeader={t('Hardware devices')}
        />
      </DescriptionList>
    </GridItem>
  );
};

export default VirtualMachineDetailsRightGridLayout;
