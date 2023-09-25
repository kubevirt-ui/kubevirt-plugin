import React, { FC } from 'react';
import { useParams } from 'react-router-dom';

import { updateVMCPUMemory } from '@catalog/templatescatalog/utils/helpers';
import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { WizardOverviewDisksTable } from '@catalog/wizard/tabs/overview/components/WizardOverviewDisksTable/WizardOverviewDisksTable';
import { WizardOverviewNetworksTable } from '@catalog/wizard/tabs/overview/components/WizardOverviewNetworksTable/WizardOverviewNetworksTable';
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import { CpuMemHelperTextResources } from '@kubevirt-utils/components/CPUDescription/utils/utils';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CpuMemoryModal';
import HardwareDevices from '@kubevirt-utils/components/HardwareDevices/HardwareDevices';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateDisks,
  getTemplateInterfaces,
  getTemplateNetworks,
  getTemplateVirtualMachineObject,
} from '@kubevirt-utils/resources/template';
import { getCPU, getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

type TemplatesCatalogDrawerLeftColumnProps = {
  setUpdatedVM: React.Dispatch<React.SetStateAction<V1VirtualMachine>>;
  template: V1Template;
  updatedVM: V1VirtualMachine;
};

const TemplatesCatalogDrawerRightColumn: FC<TemplatesCatalogDrawerLeftColumnProps> = ({
  setUpdatedVM,
  template,
  updatedVM,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { updateVM } = useWizardVMContext();
  const { ns } = useParams<{ ns: string }>();

  const disks = getTemplateDisks(template);
  const interfaces = getTemplateInterfaces(template);
  const networks = getTemplateNetworks(template);
  const vmObject = getTemplateVirtualMachineObject(template);
  const hostDevicesCount = getHostDevices(vmObject)?.length || 0;
  const gpusCount = getGPUDevices(vmObject)?.length || 0;
  const hardwareDevicesCount = hostDevicesCount + gpusCount;

  return (
    <DescriptionList>
      <VirtualMachineDescriptionItem
        bodyContent={
          <CPUDescription
            cpu={getCPU(updatedVM)}
            helperTextResource={CpuMemHelperTextResources.FutureVM}
          />
        }
        onEditClick={() =>
          createModal(({ isOpen, onClose }) => (
            <CPUMemoryModal
              isOpen={isOpen}
              onClose={onClose}
              onSubmit={updateVMCPUMemory(ns || DEFAULT_NAMESPACE, updateVM, setUpdatedVM)}
              templateNamespace={template?.metadata?.namespace}
              vm={updatedVM}
            />
          ))
        }
        descriptionData={<CPUMemory vm={updatedVM} />}
        descriptionHeader={t('CPU | Memory')}
        isEdit
        isPopover
      />
      <DescriptionListGroup>
        <DescriptionListTerm>
          {t('Network interfaces')}
          {` (${networks.length})`}
        </DescriptionListTerm>
        <DescriptionListDescription>
          <WizardOverviewNetworksTable interfaces={interfaces} networks={networks} />
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>
          {t('Disks')}
          {` (${disks.length})`}
        </DescriptionListTerm>
        <DescriptionListDescription>
          <WizardOverviewDisksTable vm={vmObject} />
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>
          {t('Hardware devices')}
          {` (${hardwareDevicesCount})`}
        </DescriptionListTerm>
        <DescriptionListDescription>
          <HardwareDevices hideEdit vm={vmObject} />
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};

export default TemplatesCatalogDrawerRightColumn;
