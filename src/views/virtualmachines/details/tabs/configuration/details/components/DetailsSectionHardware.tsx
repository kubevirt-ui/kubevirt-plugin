import React, { FC, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import HardwareDevicesTable from '@kubevirt-utils/components/HardwareDevices/HardwareDevicesTable';
import HardwareDeviceTitle from '@kubevirt-utils/components/HardwareDevices/HardwareDeviceTitle';
import HardwareDevicesModal from '@kubevirt-utils/components/HardwareDevices/modal/HardwareDevicesModal';
import { HARDWARE_DEVICE_TYPE } from '@kubevirt-utils/components/HardwareDevices/utils/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
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
  const [isExpanded, setIsExpanded] = useState<boolean>();
  const onSubmit = onSubmitProp || updateHardwareDevices;
  const hostDevices = getHostDevices(vm);
  const gpus = getGPUDevices(vm);

  useEffect(() => {
    expandURLHash(getSearchItemsIds(getDetailsTabHardwareIds(vm)), location?.hash, setIsExpanded);
  }, [location?.hash, vm]);

  const onEditHostDevices = () => {
    createModal(({ isOpen, onClose }) => (
      <HardwareDevicesModal
        btnText={t('Add Host device')}
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
        btnText={t('Add GPU device')}
        headerText={t('GPU devices')}
        initialDevices={gpus}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={(updatedVM) => onSubmit(HARDWARE_DEVICE_TYPE.GPUS, updatedVM)}
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
        <GridItem span={4}>
          <HardwareDeviceTitle canEdit onClick={onEditGPU} title={t('GPU devices')} />
          <HardwareDevicesTable devices={gpus} />
        </GridItem>

        <GridItem span={1}>
          <Bullseye>
            <Flex className={'DetailsSection-divider__height'}>
              <Divider orientation={{ default: 'vertical' }} />
            </Flex>
          </Bullseye>
        </GridItem>

        <GridItem span={4}>
          <HardwareDeviceTitle canEdit onClick={onEditHostDevices} title={t('Host devices')} />
          <HardwareDevicesTable devices={hostDevices} />
        </GridItem>
      </Grid>
    </ExpandableSection>
  );
};

export default DetailsSectionHardware;
