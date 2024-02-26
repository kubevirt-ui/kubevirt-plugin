import * as React from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import OwnerDetailsItem from '@kubevirt-utils/components/OwnerDetailsItem/OwnerDetailsItem';
import SSHAccess from '@kubevirt-utils/components/SSHAccess/SSHAccess';
import useSSHService from '@kubevirt-utils/components/SSHAccess/useSSHService';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getMachineType } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Grid, GridItem, Icon, Title } from '@patternfly/react-core';
import { LinkIcon } from '@patternfly/react-icons';

import VirtualMachinesInstancesStatus from '../../../../../components/VirtualMachinesInstancesStatus';
import useGuestOS from '../../../../hooks/useGuestOS';

import Annotations from './Annotations/Annotations';
import BootOrder from './BootOrder/BootOrder';
import CPUMemory from './CPUMemory/CPUMemory';
import CreateAt from './CreateAt/CreateAt';
import Description from './Description/Description';
import HardwareDevices from './HadwareDevices/HardwareDevices';
import Hostname from './Hostname/Hostname';
import IP from './IP/IP';
import Labels from './Labels/Labels';
import Name from './Name/Name';
import Namespace from './Namespace/Namespace';
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
          <DescriptionList className="pf-c-description-list">
            <Name name={vmi?.metadata?.name} />
            <Namespace namespace={vmi?.metadata?.namespace} />
            <Labels vmi={vmi} />
            <Annotations vmi={vmi} />
            <Description vmi={vmi} />
            <OperatingSystem
              guestAgentData={guestAgentData}
              loadedGuestAgent={loadedGuestAgent}
              vmi={vmi}
            />
            <CPUMemory vmi={vmi} />
            <VirtualMachineDescriptionItem
              bodyContent={t(
                'The machine type defines the virtual hardware configuration while the operating system name and version refer to the hypervisor.',
              )}
              descriptionData={getMachineType(vm) || NO_DATA_DASH}
              descriptionHeader={t('Machine type')}
              isPopover
            />
            <CreateAt timestamp={vmi?.metadata?.creationTimestamp} />
            <OwnerDetailsItem obj={vmi} />
          </DescriptionList>
        </GridItem>
        <GridItem span={1}></GridItem>
        <GridItem span={5}>
          <DescriptionList className="pf-c-description-list">
            <VirtualMachineDescriptionItem
              descriptionData={<VirtualMachinesInstancesStatus status={vmi?.status?.phase} />}
              descriptionHeader={t('Status')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={<Pods vmi={vmi} />}
              descriptionHeader={t('Pod')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                <BootOrder
                  disks={vmi?.spec?.domain?.devices?.disks}
                  interfaces={vmi?.spec?.domain?.devices?.interfaces}
                />
              }
              descriptionHeader={t('Boot order')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={<IP vmi={vmi} />}
              descriptionHeader={t('IP address')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={<Hostname guestAgentData={guestAgentData} />}
              descriptionHeader={'Hostname'}
            />
            <VirtualMachineDescriptionItem
              descriptionData={<Timezone guestAgentData={guestAgentData} />}
              descriptionHeader={t('Time zone')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={<Node nodeName={vmi?.status?.nodeName} />}
              descriptionHeader={t('Node')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={<WorkloadProfile annotations={vmi?.metadata?.annotations} />}
              descriptionHeader={t('Workload profile')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                <SSHAccess
                  sshService={sshService}
                  sshServiceLoaded={sshServiceLoaded}
                  vm={vm}
                  vmi={vmi}
                />
              }
              descriptionHeader={t('SSH access')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={<HardwareDevices devices={vmi?.spec?.domain?.devices} />}
              descriptionHeader={t('Hardware devices')}
            />
          </DescriptionList>
        </GridItem>
      </Grid>
    </div>
  );
};

export default Details;
