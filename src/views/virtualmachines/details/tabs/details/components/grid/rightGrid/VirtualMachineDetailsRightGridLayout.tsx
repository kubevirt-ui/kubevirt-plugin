import * as React from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import MutedTextDiv from '@kubevirt-utils/components/MutedTextDiv/MutedTextDiv';
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
import HardwareDevicesModal from '../../modals/HardwareDevices/HardwareDevicesModal';
import { HARDWARE_DEVICE_TYPE } from '../../modals/HardwareDevices/utils/constants';
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
  const [gpuModalOpen, setGPUModalOpen] = React.useState(false);
  const [hostDevModalOpen, setHostDevModalOpen] = React.useState(false);
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
              <MutedTextDiv text={t('Not available')} />
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
              <a onClick={() => setGPUModalOpen(true)}>{t(`${(gpus || []).length} GPU devices`)}</a>
              {gpuModalOpen && (
                <HardwareDevicesModal
                  vm={vm}
                  isOpen={gpuModalOpen}
                  onClose={() => setGPUModalOpen(false)}
                  headerText={t('GPU Devices')}
                  onSubmit={onSubmit}
                  initialDevices={gpus}
                  btnText={t('Add GPU device')}
                  type={HARDWARE_DEVICE_TYPE.GPUS}
                />
              )}
              <br />
              <a onClick={() => setHostDevModalOpen(true)}>
                {t(`${(hostDevices || []).length} Host devices`)}
              </a>
              {hostDevModalOpen && (
                <HardwareDevicesModal
                  vm={vm}
                  isOpen={hostDevModalOpen}
                  onClose={() => setHostDevModalOpen(false)}
                  headerText={t('Host Devices')}
                  onSubmit={onSubmit}
                  initialDevices={hostDevices}
                  btnText={t('Add Host device')}
                  type={HARDWARE_DEVICE_TYPE.HOST_DEVICES}
                />
              )}
            </>
          }
          descriptionHeader={t('Hardware devices')}
        />
      </DescriptionList>
    </GridItem>
  );
};

export default VirtualMachineDetailsRightGridLayout;
