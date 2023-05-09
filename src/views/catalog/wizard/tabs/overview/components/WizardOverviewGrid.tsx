import React, { FC } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { UpdateValidatedVM } from '@catalog/utils/WizardVMContext';
import { TabsData } from '@catalog/utils/WizardVMContext/utils/tabs-data';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CpuMemoryModal';
import { DescriptionModal } from '@kubevirt-utils/components/DescriptionModal/DescriptionModal';
import FirmwareBootloaderModal from '@kubevirt-utils/components/FirmwareBootloaderModal/FirmwareBootloaderModal';
import { getBootloaderTitleFromVM } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
import HardwareDevices from '@kubevirt-utils/components/HardwareDevices/HardwareDevices';
import HostnameModal from '@kubevirt-utils/components/HostnameModal/HostnameModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import StartPauseModal from '@kubevirt-utils/components/StartPauseModal/StartPauseModal';
import WorkloadProfileModal from '@kubevirt-utils/components/WorkloadProfileModal/WorkloadProfileModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { getVmCPUMemory, WORKLOADS_LABELS } from '@kubevirt-utils/resources/template';
import {
  getGPUDevices,
  getHostDevices,
  getMachineType,
  getWorkload,
  VM_WORKLOAD_ANNOTATION,
} from '@kubevirt-utils/resources/vm';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { DescriptionList, Grid, GridItem } from '@patternfly/react-core';

import { WizardDescriptionItem } from '../../../components/WizardDescriptionItem';

import { WizardOverviewDisksTable } from './WizardOverviewDisksTable/WizardOverviewDisksTable';
import { WizardOverviewNetworksTable } from './WizardOverviewNetworksTable/WizardOverviewNetworksTable';

type WizardOverviewGridProps = {
  vm: V1VirtualMachine;
  tabsData: TabsData;
  updateVM: UpdateValidatedVM;
};

const WizardOverviewGrid: FC<WizardOverviewGridProps> = ({ vm, tabsData, updateVM }) => {
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

  const updateWorkload = (newWorkload: string) => {
    return updateVM((draftVM) => {
      if (!draftVM.spec.template.metadata?.annotations)
        draftVM.spec.template.metadata.annotations = {};

      draftVM.spec.template.metadata.annotations[VM_WORKLOAD_ANNOTATION] = newWorkload;
    });
  };

  return (
    <Grid hasGutter className="wizard-overview-tab__grid">
      <GridItem span={6} rowSpan={4}>
        <DescriptionList>
          <WizardDescriptionItem
            title={t('Name')}
            description={vm.metadata.name}
            testId="wizard-overview-name"
            helperPopover={{ header: t('Name'), content: t('Name of the VirtualMachine') }}
          />

          <WizardDescriptionItem
            title={t('Namespace')}
            testId="wizard-overview-namespace"
            description={vm.metadata.namespace}
            helperPopover={{
              header: t('Namespace'),
              content: t('Namespace of the VirtualMachine'),
            }}
          />

          <WizardDescriptionItem
            title={t('Description')}
            description={description}
            isEdit
            testId="wizard-overview-description"
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <DescriptionModal
                  obj={vm}
                  isOpen={isOpen}
                  onClose={onClose}
                  onSubmit={(updatedDescription) => {
                    return updateVM((vmDraft) => {
                      if (updatedDescription) {
                        vmDraft.metadata.annotations['description'] = updatedDescription;
                      } else {
                        delete vmDraft.metadata.annotations['description'];
                      }
                    });
                  }}
                />
              ))
            }
            helperPopover={{
              header: t('Description'),
              content: t('Description of the VirtualMachine'),
            }}
          />

          <WizardDescriptionItem
            title={t('Operating system')}
            description={displayName}
            testId="wizard-overview-operating-system"
          />

          <WizardDescriptionItem
            className="wizard-overview-description-left-column"
            title={t('CPU | Memory')}
            isEdit
            testId="wizard-overview-cpu-memory"
            helperPopover={{
              header: t('CPU | Memory'),
              content: <CPUDescription cpu={vm?.spec?.template?.spec?.domain?.cpu} />,
            }}
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <CPUMemoryModal vm={vm} isOpen={isOpen} onClose={onClose} onSubmit={updateVM} />
              ))
            }
            description={t('{{cpuCount}} CPU | {{memory}} Memory', {
              cpuCount,
              memory: readableSizeUnit(memory),
            })}
          />

          <WizardDescriptionItem
            className="wizard-overview-description-left-column"
            title={t('Machine type')}
            testId="wizard-overview-machine-type"
            description={getMachineType(vm)}
            helperPopover={{
              header: t('Machine type'),
              content: t(
                'The machine type defines the virtual hardware configuration while the operating system name and version refer to the hypervisor.',
              ),
            }}
          />

          <WizardDescriptionItem
            title={t('Boot mode')}
            isEdit
            testId="wizard-overview-boot-method"
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <FirmwareBootloaderModal
                  vm={vm}
                  isOpen={isOpen}
                  onClose={onClose}
                  onSubmit={updateVM}
                />
              ))
            }
            description={getBootloaderTitleFromVM(vm)}
          />

          <WizardDescriptionItem
            title={t('Start in pause mode')}
            description={startStrategy ? t('ON') : t('OFF')}
            isEdit
            testId="start-in-pause-mode"
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <StartPauseModal
                  vm={vm}
                  isOpen={isOpen}
                  onClose={onClose}
                  onSubmit={updateVM}
                  headerText={t('Start in pause mode')}
                />
              ))
            }
          />

          <WizardDescriptionItem
            className="wizard-overview-description-left-column"
            title={t('Workload profile')}
            isEdit
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
            description={WORKLOADS_LABELS?.[workloadAnnotation] ?? t('Other')}
            testId="wizard-overview-workload-profile"
          />
        </DescriptionList>
      </GridItem>
      <GridItem span={6} rowSpan={4}>
        <DescriptionList>
          <WizardDescriptionItem
            title={t('Network interfaces')}
            count={networks?.length}
            onTitleClick={() =>
              history.push(`/k8s/ns/${ns}/templatescatalog/review/network-interfaces`)
            }
            description={
              <WizardOverviewNetworksTable
                isInlineGrid
                networks={networks}
                interfaces={interfaces}
              />
            }
            testId="wizard-overview-network-interfaces"
          />

          <WizardDescriptionItem
            title={t('Disks')}
            count={disks?.length}
            testId="wizard-overview-disks"
            onTitleClick={() => history.push(`/k8s/ns/${ns}/templatescatalog/review/disks`)}
            description={<WizardOverviewDisksTable isInlineGrid vm={vm} />}
          />

          <WizardDescriptionItem
            count={nDevices}
            description={<HardwareDevices vm={vm} onSubmit={updateVM} />}
            title={t('Hardware devices')}
            testId="wizard-overview-hardware-devices"
          />

          <WizardDescriptionItem
            title={t('Hostname')}
            description={hostname || vmName}
            isEdit
            testId="wizard-overview-hostname"
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <HostnameModal vm={vm} isOpen={isOpen} onClose={onClose} onSubmit={updateVM} />
              ))
            }
          />
        </DescriptionList>
      </GridItem>
    </Grid>
  );
};

export default WizardOverviewGrid;
