import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { WizardTab } from '@catalog/wizard/tabs';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CpuMemoryModal';
import { DescriptionModal } from '@kubevirt-utils/components/DescriptionModal/DescriptionModal';
import FirmwareBootloaderModal from '@kubevirt-utils/components/FirmwareBootloaderModal/FirmwareBootloaderModal';
import { getBootloaderTitleFromVM } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
import HardwareDevices from '@kubevirt-utils/components/HardwareDevices/HardwareDevices';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { getVmCPUMemory, WORKLOADS_LABELS } from '@kubevirt-utils/resources/template';
import { getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { DescriptionList, Grid, GridItem } from '@patternfly/react-core';

import { WizardDescriptionItem } from '../../components/WizardDescriptionItem';

import { WizardOverviewDisksTable } from './components/WizardOverviewDisksTable/WizardOverviewDisksTable';
import { WizardOverviewNetworksTable } from './components/WizardOverviewNetworksTable/WizardOverviewNetworksTable';

import './WizardOverviewTab.scss';

const WizardOverviewTab: WizardTab = ({ vm, tabsData, updateVM }) => {
  const history = useHistory();
  const { ns } = useParams<{ ns: string }>();
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const { cpuCount, memory } = getVmCPUMemory(vm);
  const description = getAnnotation(vm, 'description');
  const workloadAnnotation = vm?.spec?.template?.metadata?.annotations?.['vm.kubevirt.io/workload'];
  const networks = vm?.spec?.template?.spec?.networks;
  const interfaces = vm?.spec?.template?.spec?.domain?.devices?.interfaces;
  const disks = vm?.spec?.template?.spec?.domain?.devices?.disks;
  const displayName = tabsData?.overview?.templateMetadata?.displayName;

  const hostDevicesCount = getHostDevices(vm)?.length || 0;
  const gpusCount = getGPUDevices(vm)?.length || 0;
  const nDevices = hostDevicesCount + gpusCount;

  return (
    <div className="co-m-pane__body">
      <Grid hasGutter>
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
              onEditClick={() =>
                createModal(({ isOpen, onClose }) => (
                  <CPUMemoryModal vm={vm} isOpen={isOpen} onClose={onClose} onSubmit={updateVM} />
                ))
              }
              description={
                <>
                  {t('CPU')} {cpuCount} | {t('Memory')} {readableSizeUnit(memory)}
                </>
              }
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
              description={getBootloaderTitleFromVM(vm, t)}
            />

            <WizardDescriptionItem
              className="wizard-overview-description-left-column"
              title={t('Workload profile')}
              description={WORKLOADS_LABELS?.[workloadAnnotation] ?? t('Other')}
              testId="wizard-overview-workload-profile"
            />
          </DescriptionList>
        </GridItem>
        <GridItem span={6} rowSpan={4}>
          <DescriptionList>
            <WizardDescriptionItem
              title={t('Network Interfaces')}
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
          </DescriptionList>
        </GridItem>
      </Grid>
    </div>
  );
};

export default WizardOverviewTab;
