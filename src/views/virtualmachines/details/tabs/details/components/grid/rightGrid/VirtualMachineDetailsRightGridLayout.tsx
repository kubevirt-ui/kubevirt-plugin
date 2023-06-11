import * as React from 'react';
import produce from 'immer';

import { NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { BootOrderModal } from '@kubevirt-utils/components/BootOrderModal/BootOrderModal';
import HardwareDevices from '@kubevirt-utils/components/HardwareDevices/HardwareDevices';
import HostnameModal from '@kubevirt-utils/components/HostnameModal/HostnameModal';
import LinuxLabel from '@kubevirt-utils/components/Labels/LinuxLabel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import SSHAccess from '@kubevirt-utils/components/SSHAccess/SSHAccess';
import useSSHService from '@kubevirt-utils/components/SSHAccess/useSSHService';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import WorkloadProfileModal from '@kubevirt-utils/components/WorkloadProfileModal/WorkloadProfileModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { WORKLOADS, WORKLOADS_LABELS } from '@kubevirt-utils/resources/template';
import { getWorkload, VM_WORKLOAD_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { k8sUpdate, K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, GridItem } from '@patternfly/react-core';
import VirtualMachineStatus from '@virtualmachines/list/components/VirtualMachineStatus/VirtualMachineStatus';

import { VirtualMachineDetailsRightGridLayoutPresentation } from '../../../utils/gridHelper';
import BootOrderSummary from '../../BootOrderSummary/BootOrderSummary';

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

  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const hostname = vm?.spec?.template?.spec?.hostname;
  const vmName = vm?.metadata?.name;
  const [canGetNode] = useAccessReview({
    namespace: vmi?.metadata?.namespace,
    resource: NodeModel.plural,
    verb: 'get' as K8sVerb,
  });

  const onSubmit = React.useCallback(
    (obj: V1VirtualMachine) =>
      k8sUpdate({
        data: obj,
        model: VirtualMachineModel,
        name: obj.metadata.name,
        ns: obj.metadata.namespace,
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
      data: updateVM,
      model: VirtualMachineModel,
      name: updateVM?.metadata?.name,
      ns: updateVM?.metadata?.namespace,
    });
  };

  return (
    <GridItem span={5}>
      <DescriptionList>
        <VirtualMachineDescriptionItem
          data-test-id={`${vm?.metadata?.name}-status`}
          descriptionData={<VirtualMachineStatus vm={vm} />}
          descriptionHeader={t('Status')}
        />
        <VirtualMachineDescriptionItem
          data-test-id={`${vm?.metadata?.name}-pod`}
          descriptionData={vmDetailsRightGridObj?.pod}
          descriptionHeader={t('Pod')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.vmi}
          descriptionHeader={t('VirtualMachineInstance')}
        />
        <VirtualMachineDescriptionItem
          onEditClick={() =>
            createModal((props) => (
              <BootOrderModal {...props} onSubmit={onSubmit} vm={vm} vmi={vmi} />
            ))
          }
          data-test-id={`${vm?.metadata?.name}-boot-order`}
          descriptionData={<BootOrderSummary vm={vm} />}
          descriptionHeader={t('Boot order')}
          isEdit
        />
        <VirtualMachineDescriptionItem
          data-test-id={`${vm?.metadata?.name}-ip-address`}
          descriptionData={vmDetailsRightGridObj?.ipAddress}
          descriptionHeader={t('IP address')}
        />
        <VirtualMachineDescriptionItem
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <HostnameModal
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
                vm={vm}
                vmi={vmi}
              />
            ))
          }
          data-test-id={`${vm?.metadata?.name}-hostname`}
          descriptionData={hostname || vmName}
          descriptionHeader={t('Hostname')}
          isEdit
        />
        <VirtualMachineDescriptionItem
          data-test-id={`${vm?.metadata?.name}-timezone`}
          descriptionData={vmDetailsRightGridObj?.timezone}
          descriptionHeader={t('Time zone')}
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
          data-test-id={`${vm?.metadata?.name}-workload-profile`}
          descriptionHeader={t('Workload profile')}
          isEdit
        />
        <VirtualMachineDescriptionItem
          descriptionData={
            <SSHAccess
              sshService={sshService}
              sshServiceLoaded={sshServiceLoaded}
              vm={vm}
              vmi={vmi}
            />
          }
          data-test-id={`${vm?.metadata?.name}-ssh-access`}
          descriptionHeader={t('SSH access')}
          label={<LinuxLabel />}
        />
        <VirtualMachineDescriptionItem
          descriptionData={<HardwareDevices canEdit onSubmit={onSubmit} vm={vm} vmi={vmi} />}
          descriptionHeader={t('Hardware devices')}
        />
      </DescriptionList>
    </GridItem>
  );
};

export default VirtualMachineDetailsRightGridLayout;
