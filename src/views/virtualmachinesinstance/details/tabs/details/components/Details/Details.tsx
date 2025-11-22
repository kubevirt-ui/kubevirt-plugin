import * as React from 'react';

import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DescriptionItemAnnotations from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemAnnotations';
import DescriptionItemCreatedAt from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemCreatedAt';
import DescriptionItemDescription from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemDescription';
import DescriptionItemLabels from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemLabels';
import DescriptionItemName from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemName';
import DescriptionItemNamespace from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemNamespace';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import OwnerDetailsItem from '@kubevirt-utils/components/OwnerDetailsItem/OwnerDetailsItem';
import SSHAccess from '@kubevirt-utils/components/SSHAccess/SSHAccess';
import useSSHService from '@kubevirt-utils/components/SSHAccess/useSSHService';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getMachineType } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Grid, GridItem, Icon, Title } from '@patternfly/react-core';
import { LinkIcon } from '@patternfly/react-icons';

import VirtualMachinesInstancesStatus from '../../../../../components/VirtualMachinesInstancesStatus';
import useGuestOS from '../../../../hooks/useGuestOS';

import BootOrder from './BootOrder/BootOrder';
import CPUMemory from './CPUMemory/CPUMemory';
import HardwareDevices from './HadwareDevices/HardwareDevices';
import Hostname from './Hostname/Hostname';
import IP from './IP/IP';
import Node from './Node/Node';
import OperatingSystem from './OperatingSystem/OperatingSystem';
import Pods from './Pods/Pods';
import Timezone from './Timezone/Timezone';
import WorkloadProfile from './WorkloadProfile/WorkloadProfile';

type DetailsProps = {
  pathname: string;
  vmi: V1VirtualMachineInstance;
};

const Details: React.FC<DetailsProps> = ({ pathname, vmi }) => {
  const { t } = useKubevirtTranslation();
  const [guestAgentData, loadedGuestAgent] = useGuestOS(vmi);
  const [vm] = useK8sWatchResource<V1VirtualMachine>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    name: vmi?.metadata?.name,
    namespace: vmi?.metadata?.namespace,
  });
  const [sshService, sshServiceLoaded] = useSSHService(vm);

  return (
    <div>
      <a className="link-icon" href={`${pathname}#details`}>
        <Icon size="sm">
          <LinkIcon />
        </Icon>
      </a>
      <Title className="co-section-heading" headingLevel="h2">
        {t('VirtualMachineInstance Details')}
      </Title>
      <Grid hasGutter>
        <GridItem span={5}>
          <DescriptionList>
            <DescriptionItemName model={VirtualMachineInstanceModel} resource={vmi} />
            <DescriptionItemNamespace model={VirtualMachineInstanceModel} resource={vmi} />
            <DescriptionItemLabels model={VirtualMachineInstanceModel} resource={vmi} />
            <DescriptionItemAnnotations model={VirtualMachineInstanceModel} resource={vmi} />
            <DescriptionItemDescription model={VirtualMachineInstanceModel} resource={vmi} />
            <OperatingSystem
              guestAgentData={guestAgentData}
              loadedGuestAgent={loadedGuestAgent}
              vmi={vmi}
            />
            <CPUMemory vmi={vmi} />
            <DescriptionItem
              bodyContent={t('The QEMU machine type.')}
              descriptionData={getMachineType(vm) || NO_DATA_DASH}
              descriptionHeader={t('Machine type')}
              isPopover
            />
            <DescriptionItemCreatedAt model={VirtualMachineInstanceModel} resource={vmi} />
            <OwnerDetailsItem obj={vmi} />
          </DescriptionList>
        </GridItem>
        <GridItem span={1}></GridItem>
        <GridItem span={5}>
          <DescriptionList>
            <DescriptionItem
              descriptionData={<VirtualMachinesInstancesStatus status={vmi?.status?.phase} />}
              descriptionHeader={t('Status')}
            />
            <DescriptionItem descriptionData={<Pods vmi={vmi} />} descriptionHeader={t('Pod')} />
            <DescriptionItem
              descriptionData={
                <BootOrder
                  disks={vmi?.spec?.domain?.devices?.disks}
                  interfaces={vmi?.spec?.domain?.devices?.interfaces}
                />
              }
              descriptionHeader={t('Boot order')}
            />
            <DescriptionItem
              descriptionData={<IP vmi={vmi} />}
              descriptionHeader={t('IP address')}
            />
            <DescriptionItem
              descriptionData={<Hostname guestAgentData={guestAgentData} />}
              descriptionHeader={'Hostname'}
            />
            <DescriptionItem
              descriptionData={<Timezone guestAgentData={guestAgentData} />}
              descriptionHeader={t('Time zone')}
            />
            <DescriptionItem
              descriptionData={<Node nodeName={vmi?.status?.nodeName} />}
              descriptionHeader={t('Node')}
            />
            <DescriptionItem
              descriptionData={<WorkloadProfile annotations={vmi?.metadata?.annotations} />}
              descriptionHeader={t('Workload profile')}
            />
            <DescriptionItem
              descriptionData={
                <SSHAccess sshService={sshService} sshServiceLoaded={sshServiceLoaded} vm={vm} />
              }
              descriptionHeader={t('SSH access')}
            />
            <DescriptionItem
              descriptionData={<HardwareDevices vmi={vmi} />}
              descriptionHeader={t('Hardware devices')}
            />
          </DescriptionList>
        </GridItem>
      </Grid>
    </div>
  );
};

export default Details;
