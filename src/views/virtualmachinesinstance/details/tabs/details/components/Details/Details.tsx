import * as React from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useSSHService from '@kubevirt-utils/components/SSHAccess/useSSHService';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getMachineType } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Title,
} from '@patternfly/react-core';
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
import Owner from './Owner/Owner';
import Pods from './Pods/Pods';
import SSHDetails from './SSHDetails/SSHDetails';
import Timezone from './Timezone/Timezone';
import WorkloadProfile from './WorkloadProfile/WorkloadProfile';

type DetailsProps = {
  vmi: V1VirtualMachineInstance;
  pathname: string;
};

const Details: React.FC<DetailsProps> = ({ vmi, pathname }) => {
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
      <a href={`${pathname}#details`} className="link-icon">
        <LinkIcon size="sm" />
      </a>
      <Title headingLevel="h2" className="co-section-heading">
        {t('VirtualMachineInstance Details')}
      </Title>
      <Grid hasGutter>
        <GridItem span={5}>
          <DescriptionList>
            <DescriptionListGroup>
              <Name name={vmi?.metadata?.name} />
            </DescriptionListGroup>
            <DescriptionListGroup>
              <Namespace namespace={vmi?.metadata?.namespace} />
            </DescriptionListGroup>
            <DescriptionListGroup>
              <Labels vmi={vmi} />
            </DescriptionListGroup>
            <DescriptionListGroup>
              <Annotations vmi={vmi} />
            </DescriptionListGroup>
            <DescriptionListGroup>
              <Description vmi={vmi} />
            </DescriptionListGroup>
            <DescriptionListGroup>
              <OperatingSystem
                vmi={vmi}
                guestAgentData={guestAgentData}
                loadedGuestAgent={loadedGuestAgent}
              />
            </DescriptionListGroup>
            <DescriptionListGroup>
              <CPUMemory vmi={vmi} />
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Machine type')}</DescriptionListTerm>
              <DescriptionListDescription>
                {getMachineType(vm) || NO_DATA_DASH}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <CreateAt timestamp={vmi?.metadata?.creationTimestamp} />
            </DescriptionListGroup>
            <DescriptionListGroup>
              <Owner
                namespace={vmi?.metadata?.namespace}
                ownerReferences={vmi?.metadata?.ownerReferences}
              />
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
        <GridItem span={1}></GridItem>
        <GridItem span={5}>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
              <DescriptionListDescription>
                <VirtualMachinesInstancesStatus status={vmi?.status?.phase} />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Pod')}</DescriptionListTerm>
              <DescriptionListDescription>
                <Pods vmi={vmi} />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Boot order')}</DescriptionListTerm>
              <DescriptionListDescription>
                <BootOrder
                  disks={vmi?.spec?.domain?.devices?.disks}
                  interfaces={vmi?.spec?.domain?.devices?.interfaces}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('IP address')}</DescriptionListTerm>
              <DescriptionListDescription>
                <IP vmi={vmi} />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Hostname')}</DescriptionListTerm>
              <DescriptionListDescription>
                <Hostname guestAgentData={guestAgentData} />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Time zone')}</DescriptionListTerm>
              <DescriptionListDescription>
                <Timezone guestAgentData={guestAgentData} />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Node')}</DescriptionListTerm>
              <DescriptionListDescription>
                <Node nodeName={vmi?.status?.nodeName} />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Workload profile')}</DescriptionListTerm>
              <DescriptionListDescription>
                <WorkloadProfile annotations={vmi?.metadata?.annotations} />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <SSHDetails
                vmi={vmi}
                vm={vm}
                sshService={sshService}
                sshServiceLoaded={sshServiceLoaded}
              />
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Hardware devices')}</DescriptionListTerm>
              <DescriptionListDescription>
                <HardwareDevices devices={vmi?.spec?.domain?.devices} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
      </Grid>
    </div>
  );
};

export default Details;
