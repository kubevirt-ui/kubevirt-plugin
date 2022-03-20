import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CpuMemoryModal';
import { DescriptionModal } from '@kubevirt-utils/components/DescriptionModal/DescriptionModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS, getVmCPUMemory, WORKLOADS_LABELS } from '@kubevirt-utils/resources/template';
import { DescriptionList, Grid, GridItem } from '@patternfly/react-core';

import { WizardVMContextType } from '../../../utils/WizardVMContext';
import { WizardDescriptionItem } from '../../components/WizardDescriptionItem';

import { WizardOverviewDisksTable } from './components/WizardOverviewDisksTable/WizardOverviewDisksTable';
import { WizardOverviewNetworksTable } from './components/WizardOverviewNetworksTable/WizardOverviewNetworksTable';

import './WizardOverviewTab.scss';

const WizardOverviewTab: React.FC<WizardVMContextType> = ({ vm, updateVM }) => {
  const history = useHistory();
  const { ns } = useParams<{ ns: string }>();
  const { t } = useKubevirtTranslation();

  const os = getAnnotation(
    vm,
    ANNOTATIONS.displayName,
    vm?.spec?.template?.metadata?.annotations?.['vm.kubevirt.io/os'],
  );
  const flavor = getVmCPUMemory(vm);
  const description = getAnnotation(vm, 'description');
  const workloadAnnotation = vm?.spec?.template?.metadata?.annotations?.['vm.kubevirt.io/workload'];
  const networks = vm?.spec?.template?.spec?.networks;
  const interfaces = vm?.spec?.template?.spec?.domain?.devices?.interfaces;
  const disks = vm?.spec?.template?.spec?.domain?.devices?.disks;

  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = React.useState(false);
  const [isCPUMemoryModalOpen, setIsCPUMemoryModalOpen] = React.useState(false);

  return (
    <div className="co-m-pane__body">
      <Grid hasGutter>
        <GridItem span={6} rowSpan={4}>
          <DescriptionList>
            <WizardDescriptionItem
              title={t('Name')}
              description={vm.metadata.name}
              helperPopover={{ header: t('Name'), content: t('Name of the VirtualMachine') }}
            />

            <WizardDescriptionItem
              title={t('Namespace')}
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
              onEditClick={() => setIsDescriptionModalOpen(true)}
              helperPopover={{
                header: t('Description'),
                content: t('Description of the VirtualMachine'),
              }}
            />
            <DescriptionModal
              obj={vm}
              isOpen={isDescriptionModalOpen}
              onClose={() => setIsDescriptionModalOpen(false)}
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

            <WizardDescriptionItem title={t('Operating system')} description={os} />

            <WizardDescriptionItem
              className="wizard-overview-description-left-column"
              title={t('CPU | Memory')}
              isEdit
              onEditClick={() => setIsCPUMemoryModalOpen(true)}
              description={
                <>
                  {t('CPU')} {flavor?.cpuCount} | {t('Memory')} {flavor?.memory}
                </>
              }
            />
            <CPUMemoryModal
              vm={vm}
              isOpen={isCPUMemoryModalOpen}
              onClose={() => setIsCPUMemoryModalOpen(false)}
              onSubmit={updateVM}
            />

            <WizardDescriptionItem
              className="wizard-overview-description-left-column"
              title={t('Workload profile')}
              description={WORKLOADS_LABELS?.[workloadAnnotation]}
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
                <WizardOverviewNetworksTable networks={networks} interfaces={interfaces} />
              }
            />

            <WizardDescriptionItem
              title={t('Disks')}
              count={disks?.length}
              onTitleClick={() => history.push(`/k8s/ns/${ns}/templatescatalog/review/disks`)}
              description={<WizardOverviewDisksTable vm={vm} />}
            />

            <WizardDescriptionItem title={t('Hardware Devices')} />
          </DescriptionList>
        </GridItem>
      </Grid>
    </div>
  );
};

export default WizardOverviewTab;
