import React, { FC, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { UpdateValidatedVM } from '@catalog/utils/WizardVMContext';
import { TabsData } from '@catalog/utils/WizardVMContext/utils/tabs-data';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import { CpuMemHelperTextResources } from '@kubevirt-utils/components/CPUDescription/utils/utils';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CpuMemoryModal';
import { DescriptionModal } from '@kubevirt-utils/components/DescriptionModal/DescriptionModal';
import FirmwareBootloaderModal from '@kubevirt-utils/components/FirmwareBootloaderModal/FirmwareBootloaderModal';
import { getBootloaderTitleFromVM } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
import HardwareDevices from '@kubevirt-utils/components/HardwareDevices/HardwareDevices';
import HostnameModal from '@kubevirt-utils/components/HostnameModal/HostnameModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import WorkloadProfileModal from '@kubevirt-utils/components/WorkloadProfileModal/WorkloadProfileModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { getVmCPUMemory, WORKLOADS_LABELS } from '@kubevirt-utils/resources/template';
import {
  getCPU,
  getGPUDevices,
  getHostDevices,
  getMachineType,
  getWorkload,
  VM_WORKLOAD_ANNOTATION,
} from '@kubevirt-utils/resources/vm';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { DescriptionList, Grid, GridItem, Switch } from '@patternfly/react-core';
import { printableVMStatus } from '@virtualmachines/utils';

import { WizardDescriptionItem } from '../../../components/WizardDescriptionItem';

import VMNameModal from './VMNameModal/VMNameModal';
import { WizardOverviewDisksTable } from './WizardOverviewDisksTable/WizardOverviewDisksTable';
import { WizardOverviewNetworksTable } from './WizardOverviewNetworksTable/WizardOverviewNetworksTable';

type WizardOverviewGridProps = {
  tabsData: TabsData;
  updateVM: UpdateValidatedVM;
  vm: V1VirtualMachine;
};

const WizardOverviewGrid: FC<WizardOverviewGridProps> = ({ tabsData, updateVM, vm }) => {
  const history = useHistory();
  const { ns } = useParams<{ ns: string }>();
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { cpuCount, memory } = getVmCPUMemory(vm);
  const description = getAnnotation(vm, 'description');
  const workloadAnnotation = getWorkload(vm);
  const startStrategy = vm?.spec?.template?.spec?.startStrategy;
  const hostname = vm?.spec?.template?.spec?.hostname;
  const vmName = vm?.metadata?.name;
  const networks = vm?.spec?.template?.spec?.networks;
  const interfaces = vm?.spec?.template?.spec?.domain?.devices?.interfaces;
  const disks = vm?.spec?.template?.spec?.domain?.devices?.disks;
  const displayName = tabsData?.overview?.templateMetadata?.displayName;

  const hostDevicesCount = getHostDevices(vm)?.length || 0;
  const gpusCount = getGPUDevices(vm)?.length || 0;
  const nDevices = hostDevicesCount + gpusCount;
  const [isChecked, setIsChecked] = useState<boolean>(!!startStrategy);

  const updateWorkload = (newWorkload: string) => {
    return updateVM((draftVM) => {
      if (!draftVM.spec.template.metadata?.annotations)
        draftVM.spec.template.metadata.annotations = {};

      draftVM.spec.template.metadata.annotations[VM_WORKLOAD_ANNOTATION] = newWorkload;
    });
  };

  const updateStartStrategy = (checked: boolean) => {
    return updateVM((vmDraft) => {
      vmDraft.spec.template.spec.startStrategy = checked ? printableVMStatus.Paused : null;
    });
  };

  return (
    <Grid className="wizard-overview-tab__grid" hasGutter>
      <GridItem rowSpan={4} span={6}>
        <DescriptionList>
          <WizardDescriptionItem
            onEditClick={() =>
              createModal((modalProps) => (
                <VMNameModal {...modalProps} onSubmit={updateVM} vm={vm} />
              ))
            }
            description={vm.metadata.name}
            helperPopover={{ content: t('Name of the VirtualMachine'), header: t('Name') }}
            isEdit
            testId="wizard-overview-name"
            title={t('Name')}
          />

          <WizardDescriptionItem
            helperPopover={{
              content: t('Namespace of the VirtualMachine'),
              header: t('Namespace'),
            }}
            description={vm.metadata.namespace}
            testId="wizard-overview-namespace"
            title={t('Namespace')}
          />

          <WizardDescriptionItem
            helperPopover={{
              content: t('Description of the VirtualMachine'),
              header: t('Description'),
            }}
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <DescriptionModal
                  onSubmit={(updatedDescription) => {
                    return updateVM((vmDraft) => {
                      if (updatedDescription) {
                        vmDraft.metadata.annotations['description'] = updatedDescription;
                      } else {
                        delete vmDraft.metadata.annotations['description'];
                      }
                    });
                  }}
                  isOpen={isOpen}
                  obj={vm}
                  onClose={onClose}
                />
              ))
            }
            description={description}
            isEdit
            testId="wizard-overview-description"
            title={t('Description')}
          />

          <WizardDescriptionItem
            description={displayName}
            testId="wizard-overview-operating-system"
            title={t('Operating system')}
          />

          <WizardDescriptionItem
            description={t('{{cpuCount}} CPU | {{memory}} Memory', {
              cpuCount,
              memory: readableSizeUnit(memory),
            })}
            helperPopover={{
              content: (
                <CPUDescription
                  cpu={getCPU(vm)}
                  helperTextResource={CpuMemHelperTextResources.FutureVM}
                />
              ),
              header: t('CPU | Memory'),
            }}
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <CPUMemoryModal isOpen={isOpen} onClose={onClose} onSubmit={updateVM} vm={vm} />
              ))
            }
            className="wizard-overview-description-left-column"
            isEdit
            testId="wizard-overview-cpu-memory"
            title={t('CPU | Memory')}
          />

          <WizardDescriptionItem
            helperPopover={{
              content: t(
                'The machine type defines the virtual hardware configuration while the operating system name and version refer to the hypervisor.',
              ),
              header: t('Machine type'),
            }}
            className="wizard-overview-description-left-column"
            description={getMachineType(vm)}
            testId="wizard-overview-machine-type"
            title={t('Machine type')}
          />

          <WizardDescriptionItem
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <FirmwareBootloaderModal
                  isOpen={isOpen}
                  onClose={onClose}
                  onSubmit={updateVM}
                  vm={vm}
                />
              ))
            }
            description={getBootloaderTitleFromVM(vm)}
            isEdit
            testId="wizard-overview-boot-method"
            title={t('Boot mode')}
          />

          <WizardDescriptionItem
            description={
              <Switch
                onChange={(checked) => {
                  setIsChecked(checked);
                  updateStartStrategy(checked);
                }}
                id="start-in-pause-mode"
                isChecked={isChecked}
              />
            }
            helperPopover={{
              content: t(
                'Applying the start/pause mode to this Virtual Machine will cause it to partially reboot and pause.',
              ),
              header: t('Start in pause mode'),
            }}
            testId="start-in-pause-mode"
            title={t('Start in pause mode')}
          />

          <WizardDescriptionItem
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <WorkloadProfileModal
                  initialWorkload={workloadAnnotation}
                  isOpen={isOpen}
                  onClose={onClose}
                  onSubmit={updateWorkload}
                />
              ))
            }
            className="wizard-overview-description-left-column"
            description={WORKLOADS_LABELS?.[workloadAnnotation] ?? t('Other')}
            isEdit
            testId="wizard-overview-workload-profile"
            title={t('Workload profile')}
          />
        </DescriptionList>
      </GridItem>
      <GridItem rowSpan={4} span={6}>
        <DescriptionList>
          <WizardDescriptionItem
            description={
              <WizardOverviewNetworksTable
                interfaces={interfaces}
                isInlineGrid
                networks={networks}
              />
            }
            onTitleClick={() =>
              history.push(`/k8s/ns/${ns}/templatescatalog/review/network-interfaces`)
            }
            count={networks?.length}
            testId="wizard-overview-network-interfaces"
            title={t('Network interfaces')}
          />

          <WizardDescriptionItem
            count={disks?.length}
            description={<WizardOverviewDisksTable isInlineGrid vm={vm} />}
            onTitleClick={() => history.push(`/k8s/ns/${ns}/templatescatalog/review/disks`)}
            testId="wizard-overview-disks"
            title={t('Disks')}
          />

          <WizardDescriptionItem
            count={nDevices}
            description={<HardwareDevices onSubmit={updateVM} vm={vm} />}
            testId="wizard-overview-hardware-devices"
            title={t('Hardware devices')}
          />

          <WizardDescriptionItem
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <HostnameModal isOpen={isOpen} onClose={onClose} onSubmit={updateVM} vm={vm} />
              ))
            }
            description={hostname || vmName}
            isEdit
            testId="wizard-overview-hostname"
            title={t('Hostname')}
          />
        </DescriptionList>
      </GridItem>
    </Grid>
  );
};

export default WizardOverviewGrid;
