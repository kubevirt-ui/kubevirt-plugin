import React, { FC, useEffect } from 'react';
import { useLocation } from 'react-router';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getClusterOnlyArchitecture } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
import HardwareDevicesTable from '@kubevirt-utils/components/HardwareDevices/HardwareDevicesTable';
import HardwareDeviceTitle from '@kubevirt-utils/components/HardwareDevices/HardwareDeviceTitle';
import HardwareDevicesModal from '@kubevirt-utils/components/HardwareDevices/modal/HardwareDevicesModal';
import { HARDWARE_DEVICE_TYPE } from '@kubevirt-utils/components/HardwareDevices/utils/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { ARCHITECTURES } from '@kubevirt-utils/constants/constants';
import { TELEMETRY_GPU_PASSTHROUGH_TYPE } from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import { logVMGPUAttached } from '@kubevirt-utils/extensions/telemetry/workload';
import useHcoWorkloadArchitectures from '@kubevirt-utils/hooks/useHcoWorkloadArchitectures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useToggle } from '@kubevirt-utils/hooks/useToggle';
import { getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import { hasS390xArchitecture } from '@kubevirt-utils/resources/vm/utils/architecture';
import { getCluster } from '@multicluster/helpers/selectors';
import { Bullseye, Divider, ExpandableSection, Flex, Grid, GridItem } from '@patternfly/react-core';

import { getSearchItemsIds } from '../../search/utils/utils';
import { expandURLHash, getDetailsTabHardwareIds } from '../../utils/search';
import { updateHardwareDevices } from '../utils/utils';

type DetailsSectionHardwareProps = {
  onSubmit?: (type: HARDWARE_DEVICE_TYPE, updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const DetailsSectionHardware: FC<DetailsSectionHardwareProps> = ({
  onSubmit: onSubmitProp,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const location = useLocation();
  const [clusterWorkloadArchitectures] = useHcoWorkloadArchitectures(getCluster(vm));
  const clusterOnlyArchitecture = getClusterOnlyArchitecture(clusterWorkloadArchitectures);
  const [isExpanded, setIsExpanded] = useToggle('hardware-devices');
  const onSubmit = onSubmitProp || updateHardwareDevices;
  const hostDevices = getHostDevices(vm);
  const gpus = getGPUDevices(vm);
  const vmHasS390xArchitecture = hasS390xArchitecture(vm);
  const isClusterS390xArchitecture = clusterOnlyArchitecture === ARCHITECTURES.S390X;

  useEffect(() => {
    expandURLHash(getSearchItemsIds(getDetailsTabHardwareIds(vm)), location?.hash, setIsExpanded);
  }, [location?.hash, vm, setIsExpanded]);

  const onEditHostDevices = () => {
    createModal(({ isOpen, onClose }) => (
      <HardwareDevicesModal
        btnText={t('Add host device')}
        headerText={t('Host devices')}
        initialDevices={hostDevices}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={(updatedVM) => onSubmit(HARDWARE_DEVICE_TYPE.HOST_DEVICES, updatedVM)}
        type={HARDWARE_DEVICE_TYPE.HOST_DEVICES}
        vm={vm}
        vmi={vmi}
      />
    ));
  };

  const onEditGPU = () => {
    createModal(({ isOpen, onClose }) => (
      <HardwareDevicesModal
        onSubmit={async (updatedVM) => {
          const result = await onSubmit(HARDWARE_DEVICE_TYPE.GPUS, updatedVM);
          const gpuDevices = getGPUDevices(updatedVM);
          logVMGPUAttached({
            gpuCount: gpuDevices?.length,
            passthroughType: TELEMETRY_GPU_PASSTHROUGH_TYPE.GPU,
          });
          return result;
        }}
        btnText={t('Add GPU device')}
        headerText={t('GPU devices')}
        initialDevices={gpus}
        isOpen={isOpen}
        onClose={onClose}
        type={HARDWARE_DEVICE_TYPE.GPUS}
        vm={vm}
        vmi={vmi}
      />
    ));
  };

  return (
    <ExpandableSection
      toggleContent={
        <SearchItem id="hardware-devices">
          {t('Hardware devices ({{devices}})', {
            devices: gpus?.length + hostDevices?.length || 0,
          })}
        </SearchItem>
      }
      isExpanded={isExpanded}
      isIndented
      onToggle={(_event, val) => setIsExpanded(val)}
    >
      <Grid>
        {!vmHasS390xArchitecture && !isClusterS390xArchitecture && (
          <>
            <GridItem span={5}>
              <HardwareDeviceTitle canEdit onClick={onEditGPU} title={t('GPU devices')} />
              <HardwareDevicesTable devices={gpus} />
            </GridItem>

            <GridItem span={1}>
              <Bullseye>
                <Flex className="DetailsSection-divider__height">
                  <Divider orientation={{ default: 'vertical' }} />
                </Flex>
              </Bullseye>
            </GridItem>
          </>
        )}

        <GridItem span={vmHasS390xArchitecture || isClusterS390xArchitecture ? 11 : 5}>
          <HardwareDeviceTitle canEdit onClick={onEditHostDevices} title={t('Host devices')} />
          <HardwareDevicesTable devices={hostDevices} />
        </GridItem>
      </Grid>
    </ExpandableSection>
  );
};

export default DetailsSectionHardware;
