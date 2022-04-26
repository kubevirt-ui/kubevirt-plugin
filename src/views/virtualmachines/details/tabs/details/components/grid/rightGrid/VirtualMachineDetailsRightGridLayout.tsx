import * as React from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { BootOrderModal } from '@kubevirt-utils/components/BootOrderModal/BootOrderModal';
import HardwareDevicesModal from '@kubevirt-utils/components/HardwareDevices/HardwareDevicesModal';
import { HARDWARE_DEVICE_TYPE } from '@kubevirt-utils/components/HardwareDevices/utils/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
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
};

const VirtualMachineDetailsRightGridLayout: React.FC<VirtualMachineDetailsRightGridLayout> = ({
  vmDetailsRightGridObj,
  vm,
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
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.pod}
          descriptionHeader={t('Pod')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={<BootOrderSummary vm={vm} />}
          descriptionHeader={t('Boot Order')}
          isEdit
          showEditOnTitle
          onEditClick={() =>
            createModal((props) => <BootOrderModal {...props} vm={vm} onSubmit={onSubmit} />)
          }
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.ipAddress}
          descriptionHeader={t('IP Address')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.hostname}
          descriptionHeader={t('Hostname')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.timezone}
          descriptionHeader={t('Time Zone')}
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
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.userCredentials}
          descriptionHeader={t('User credentials')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.sshAccess}
          descriptionHeader={t('SSH Access')}
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
