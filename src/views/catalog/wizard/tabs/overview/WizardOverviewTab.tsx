import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { WORKLOADS_LABELS } from 'src/views/catalog/utils/constants';
import { getVmCPUMemory } from 'src/views/catalog/utils/flavor';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/selectors';
import { DescriptionList, Grid, GridItem } from '@patternfly/react-core';

import { WizardVMContextType } from '../../../utils/WizardVMContext';
import { WizardDescriptionItem } from '../../components/WizardDescriptionItem';

import { WizardOverviewNetworksTable } from './components/WizardOverviewNetworksTable';

import './WizardOverviewTab.scss';

const WizardOverviewTab: React.FC<WizardVMContextType> = ({ vm }) => {
  const history = useHistory();
  const { ns } = useParams<{ ns: string }>();
  const { t } = useKubevirtTranslation();

  const description = getAnnotation(vm, 'description');
  const workloadAnnotation = vm?.spec?.template?.metadata?.annotations?.['vm.kubevirt.io/workload'];
  const os = vm?.spec?.template?.metadata?.annotations?.['vm.kubevirt.io/os'];
  const networks = vm?.spec?.template?.spec?.networks;
  const disks = vm?.spec?.template?.spec?.domain?.devices?.disks;
  const flavor = getVmCPUMemory(vm);

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
              onEditClick={() => console.log('edit description')}
              helperPopover={{
                header: t('Description'),
                content: t('Description of the VirtualMachine'),
              }}
            />

            <WizardDescriptionItem title={t('Operating system')} description={os} />

            <WizardDescriptionItem
              className="wizard-overview-description-left-column"
              title={t('CPU | Memory')}
              isEdit
              onEditClick={() => console.log('edit flavor')}
              description={
                <>
                  {t('CPU')} {flavor?.cpuCount} | {t('Memory')} {flavor?.memory}
                </>
              }
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
              description={<WizardOverviewNetworksTable networks={networks} />}
            />

            <WizardDescriptionItem
              title={t('Disks')}
              count={disks?.length}
              onTitleClick={() => history.push(`/k8s/ns/${ns}/templatescatalog/review/disks`)}
              description={disks?.map((d) => d?.name).join(', ')}
            />

            <WizardDescriptionItem title={t('Hardware Devices')} />
          </DescriptionList>
        </GridItem>
      </Grid>
    </div>
  );
};

export default WizardOverviewTab;
