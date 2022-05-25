import * as React from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { BootOrderModal } from '@kubevirt-utils/components/BootOrderModal/BootOrderModal';
import HardwareDevicesModal from '@kubevirt-utils/components/HardwareDevices/HardwareDevicesModal';
import { HARDWARE_DEVICE_TYPE } from '@kubevirt-utils/components/HardwareDevices/utils/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import SSHAccessModal from '@kubevirt-utils/components/SSHAccess/SSHAccessModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import {
  getGPUDevices,
  getHostDevices,
  VM_WORKLOAD_ANNOTATION,
} from '@kubevirt-utils/resources/vm';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, GridItem } from '@patternfly/react-core';

import VirtualMachineStatus from '../../../../../../list/components/VirtualMachineStatus/VirtualMachineStatus';
import { VirtualMachineDetailsRightGridLayoutPresentation } from '../../../utils/gridHelper';
import BootOrderSummary from '../../BootOrderSummary/BootOrderSummary';
import VirtualMachineDescriptionItem from '../../VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';

type VirtualMachineDetailsRightGridLayout = {
  vm: V1VirtualMachine;
  vmDetailsRightGridObj: VirtualMachineDetailsRightGridLayoutPresentation;
  sshService?: IoK8sApiCoreV1Service;
  vmi?: V1VirtualMachineInstance;
};

const VirtualMachineDetailsRightGridLayout: React.FC<VirtualMachineDetailsRightGridLayout> = ({
  vm,
  sshService,
  vmDetailsRightGridObj,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const hostDevices = getHostDevices(vm);
  const gpus = getGPUDevices(vm);

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
  return (
    <GridItem span={5}>
      <DescriptionList>
        <VirtualMachineDescriptionItem
          descriptionData={<VirtualMachineStatus printableStatus={vm?.status?.printableStatus} />}
          descriptionHeader={t('Status')}
          data-test-id={`${vm?.metadata?.name}-status`}
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
          descriptionHeader={t('Boot Order')}
          isEdit
          showEditOnTitle
          onEditClick={() =>
            createModal((props) => (
              <BootOrderModal {...props} vm={vm} onSubmit={onSubmit} vmi={vmi} />
            ))
          }
          data-test-id={`${vm?.metadata?.name}-boot-order`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.ipAddress}
          descriptionHeader={t('IP Address')}
          data-test-id={`${vm?.metadata?.name}-ip-address`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.hostname}
          descriptionHeader={t('Hostname')}
          data-test-id={`${vm?.metadata?.name}-hostname`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.timezone}
          descriptionHeader={t('Time Zone')}
          data-test-id={`${vm?.metadata?.name}-timezone`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.node}
          descriptionHeader={t('Node')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={
            getAnnotation(vm?.spec?.template, VM_WORKLOAD_ANNOTATION) || (
              <MutedTextSpan text={t('Not available')} />
            )
          }
          descriptionHeader={t('Workload Profile')}
          data-test-id={`${vm?.metadata?.name}-workload-profile`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.userCredentials}
          descriptionHeader={t('User credentials')}
          data-test-id={`${vm?.metadata?.name}-user-credentials`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.sshAccess}
          isEdit={!!vmi}
          showEditOnTitle
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <SSHAccessModal vmi={vmi} isOpen={isOpen} onClose={onClose} sshService={sshService} />
            ))
          }
          descriptionHeader={t('SSH Access')}
          data-test-id={`${vm?.metadata?.name}-ssh-access`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={
            <>
              <a
                onClick={() =>
                  createModal(({ isOpen, onClose }) => (
                    <HardwareDevicesModal
                      vm={vm}
                      isOpen={isOpen}
                      onClose={onClose}
                      headerText={t('GPU devices')}
                      onSubmit={onSubmit}
                      initialDevices={gpus}
                      btnText={t('Add GPU device')}
                      type={HARDWARE_DEVICE_TYPE.GPUS}
                      vmi={vmi}
                    />
                  ))
                }
              >
                {t(`${(gpus || []).length} GPU devices`)}
              </a>
              <br />
              <a
                onClick={() =>
                  createModal(({ isOpen, onClose }) => (
                    <HardwareDevicesModal
                      vm={vm}
                      isOpen={isOpen}
                      onClose={onClose}
                      headerText={t('Host devices')}
                      onSubmit={onSubmit}
                      initialDevices={hostDevices}
                      btnText={t('Add Host device')}
                      type={HARDWARE_DEVICE_TYPE.HOST_DEVICES}
                      vmi={vmi}
                    />
                  ))
                }
              >
                {t(`${(hostDevices || []).length} Host devices`)}
              </a>
            </>
          }
          descriptionHeader={t('Hardware devices')}
        />
      </DescriptionList>
    </GridItem>
  );
};

export default VirtualMachineDetailsRightGridLayout;
