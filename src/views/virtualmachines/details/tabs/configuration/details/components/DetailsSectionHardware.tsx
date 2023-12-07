import React, { FC, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

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
import { DETAILS_TAB_HARDWARE_IDS, expandURLHash } from '../../utils/search';
import { updateHardwareDevices } from '../utils/utils';

type DetailsSectionHardwareProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const DetailsSectionHardware: FC<DetailsSectionHardwareProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState<boolean>();

  const hostDevices = getHostDevices(vm);
  const gpus = getGPUDevices(vm);

  useEffect(() => {
    expandURLHash(getSearchItemsIds(DETAILS_TAB_HARDWARE_IDS), location?.hash, setIsExpanded);
  }, [location?.hash]);

  const onEditHostDevices = () => {
    createModal(({ isOpen, onClose }) => (
      <HardwareDevicesModal
        onSubmit={(updatedVM) =>
          updateHardwareDevices(HARDWARE_DEVICE_TYPE.HOST_DEVICES, updatedVM)
        }
        btnText={t('Add Host device')}
        headerText={t('Host devices')}
        initialDevices={hostDevices}
        isOpen={isOpen}
        onClose={onClose}
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
        onSubmit={(updatedVM) => updateHardwareDevices(HARDWARE_DEVICE_TYPE.GPUS, updatedVM)}
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
          {t('Hardware devices ({{count}})', {
            count: gpus?.length + hostDevices?.length || 0,
          })}
        </SearchItem>
      }
      isExpanded={isExpanded}
      isIndented
      onToggle={setIsExpanded}
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
