import React, { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom-v5-compat';

import { UpdateValidatedVM } from '@catalog/utils/WizardVMContext';
import { TabsData } from '@catalog/utils/WizardVMContext/utils/tabs-data';
import { V1Devices, V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import { CpuMemHelperTextResources } from '@kubevirt-utils/components/CPUDescription/utils/utils';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CPUMemoryModal';
import { DescriptionModal } from '@kubevirt-utils/components/DescriptionModal/DescriptionModal';
import FirmwareBootloaderModal from '@kubevirt-utils/components/FirmwareBootloaderModal/FirmwareBootloaderModal';
import { getBootloaderTitleFromVM } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
import HardwareDevices from '@kubevirt-utils/components/HardwareDevices/HardwareDevices';
import HostnameModal from '@kubevirt-utils/components/HostnameModal/HostnameModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MoveVMToFolderModal from '@kubevirt-utils/components/MoveVMToFolderModal/MoveVMToFolderModal';
import WorkloadProfileModal from '@kubevirt-utils/components/WorkloadProfileModal/WorkloadProfileModal';
import {
  DISABLED_GUEST_SYSTEM_LOGS_ACCESS,
  TREE_VIEW_FOLDERS,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation, getLabel } from '@kubevirt-utils/resources/shared';
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
import LightspeedSimplePopoverContent from '@lightspeed/components/LightspeedSimplePopoverContent';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { getCatalogURL } from '@multicluster/urls';
import { DescriptionList, Grid, GridItem, Switch } from '@patternfly/react-core';
import DeletionProtectionModal from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/DeletionProtectionModal';
import { VM_DELETION_PROTECTION_LABEL } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/constants';
import { VMDeletionProtectionOptions } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/types';
import { isDeletionProtectionEnabled } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';
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
  const navigate = useNavigate();
  const { ns } = useParams<{ ns: string }>();
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);
  const { cpuCount, memory } = getVmCPUMemory(vm);
  const { featureEnabled: isDisabledGuestSystemLogs } = useFeatures(
    DISABLED_GUEST_SYSTEM_LOGS_ACCESS,
  );
  const description = getAnnotation(vm, 'description');
  const workloadAnnotation = getWorkload(vm);
  const startStrategy = vm?.spec?.template?.spec?.startStrategy;
  const hostname = vm?.spec?.template?.spec?.hostname;
  const vmName = vm?.metadata?.name;
  const networks = vm?.spec?.template?.spec?.networks;
  const interfaces = vm?.spec?.template?.spec?.domain?.devices?.interfaces;
  const disks = vm?.spec?.template?.spec?.domain?.devices?.disks;
  const displayName = tabsData?.overview?.templateMetadata?.displayName;
  const logSerialConsole = (
    vm?.spec?.template?.spec?.domain?.devices as V1Devices & {
      logSerialConsole: boolean;
    }
  )?.logSerialConsole;

  const hostDevicesCount = getHostDevices(vm)?.length || 0;
  const gpusCount = getGPUDevices(vm)?.length || 0;
  const nDevices = hostDevicesCount + gpusCount;
  const [isChecked, setIsChecked] = useState<boolean>(!!startStrategy);
  const [isCheckedGuestSystemLogAccess, setIsCheckedGuestSystemLogAccess] = useState<boolean>();

  const cluster = useClusterParam();
  const baseCatalogURL = getCatalogURL(cluster, ns);

  useEffect(() => {
    setIsCheckedGuestSystemLogAccess(
      (logSerialConsole || logSerialConsole === undefined) && !isDisabledGuestSystemLogs,
    );
  }, [isDisabledGuestSystemLogs, logSerialConsole]);

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

  const deletionProtectionEnabled = isDeletionProtectionEnabled(vm);

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
            description={vm?.metadata?.name}
            helperPopover={{ content: t('Name of the VirtualMachine'), header: t('Name') }}
            isEdit
            testId="wizard-overview-name"
            title={t('Name')}
          />

          <WizardDescriptionItem
            helperPopover={{
              content: (hide) => (
                <LightspeedSimplePopoverContent
                  content={t('Namespace of the VirtualMachine')}
                  hide={hide}
                  obj={vm}
                  promptType={OLSPromptType.NAMESPACE}
                />
              ),
              header: t('Namespace'),
            }}
            description={vm?.metadata?.namespace}
            testId="wizard-overview-namespace"
            title={t('Namespace')}
          />

          {treeViewFoldersEnabled && (
            <WizardDescriptionItem
              onEditClick={() =>
                createModal(({ isOpen, onClose }) => (
                  <MoveVMToFolderModal
                    onSubmit={(folderName) =>
                      updateVM((draftVM) => {
                        if (!folderName) {
                          delete draftVM?.metadata?.labels?.[VM_FOLDER_LABEL];
                          return;
                        }
                        draftVM.metadata.labels = {
                          ...draftVM?.metadata?.labels,
                          [VM_FOLDER_LABEL]: folderName,
                        };
                      })
                    }
                    isOpen={isOpen}
                    onClose={onClose}
                    vm={vm}
                  />
                ))
              }
              description={getLabel(vm, VM_FOLDER_LABEL)}
              isEdit
              testId="wizard-overview-folder"
              title={t('Folder')}
            />
          )}

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
              content: (hide) => (
                <LightspeedSimplePopoverContent
                  content={
                    <CPUDescription
                      cpu={getCPU(vm)}
                      helperTextResource={CpuMemHelperTextResources.FutureVM}
                    />
                  }
                  hide={hide}
                  obj={vm}
                  promptType={OLSPromptType.CPU_MEMORY}
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
              content: (hide) => (
                <LightspeedSimplePopoverContent
                  content={t('The QEMU machine type.')}
                  hide={hide}
                  obj={vm}
                  promptType={OLSPromptType.MACHINE_TYPE}
                />
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
                onChange={(_event, checked) => {
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
            description={WORKLOADS_LABELS?.[workloadAnnotation] || t('Other')}
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
            count={networks?.length}
            onTitleClick={() => navigate(`${baseCatalogURL}/template/review/network-interfaces`)}
            testId="wizard-overview-network-interfaces"
            title={t('Network interfaces')}
          />

          <WizardDescriptionItem
            count={disks?.length}
            description={<WizardOverviewDisksTable isInlineGrid vm={vm} />}
            onTitleClick={() => navigate(`${baseCatalogURL}/template/review/disks`)}
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
          <WizardDescriptionItem
            description={
              <Switch
                onChange={(_event, checked) => {
                  setIsCheckedGuestSystemLogAccess(checked);
                  updateVM((vmDraft) => {
                    (
                      vmDraft.spec.template.spec.domain.devices as V1Devices & {
                        logSerialConsole: boolean;
                      }
                    ).logSerialConsole = checked ? null : false;
                    return vmDraft;
                  });
                }}
                id="guest-system-log-access"
                isChecked={isCheckedGuestSystemLogAccess}
                isDisabled={isDisabledGuestSystemLogs}
              />
            }
            helperPopover={{
              content: (hide) => (
                <LightspeedSimplePopoverContent
                  content={
                    isDisabledGuestSystemLogs
                      ? t('Guest system logs disabled at cluster')
                      : t(
                          'Enables access to the VirtualMachine guest system log. Wait a few seconds for logging to start before viewing the log.',
                        )
                  }
                  hide={hide}
                  obj={vm}
                  promptType={OLSPromptType.GUEST_SYSTEM_LOG_ACCESS}
                />
              ),
              header: t('Guest system log access'),
            }}
            testId="guest-system-log-access"
            title={t('Guest system log access')}
          />
          <WizardDescriptionItem
            description={
              <Switch
                onChange={(_event, checked) =>
                  createModal(({ isOpen, onClose }) => (
                    <DeletionProtectionModal
                      deletionProtectionOption={
                        checked
                          ? VMDeletionProtectionOptions.ENABLE
                          : VMDeletionProtectionOptions.DISABLE
                      }
                      onConfirm={(enableDeletionProtection) => {
                        updateVM((draftVM) => {
                          draftVM.metadata.labels = {
                            ...draftVM.metadata.labels,
                            [VM_DELETION_PROTECTION_LABEL]: enableDeletionProtection.toString(),
                          };
                        });
                        onClose();
                      }}
                      isOpen={isOpen}
                      onCancel={onClose}
                      vm={vm}
                    />
                  ))
                }
                id="deletion-protection"
                isChecked={deletionProtectionEnabled}
              />
            }
            helperPopover={{
              content: (hide) => (
                <LightspeedSimplePopoverContent
                  content={t(
                    'Applying deletion protection to this VM will prevent deletion through the web console.',
                  )}
                  hide={hide}
                  obj={vm}
                  promptType={OLSPromptType.DELETION_PROTECTION}
                />
              ),
              header: t('Deletion protection'),
            }}
            data-test-id="deletion-protection"
            title={t('Deletion protection')}
          />
        </DescriptionList>
      </GridItem>
    </Grid>
  );
};

export default WizardOverviewGrid;
