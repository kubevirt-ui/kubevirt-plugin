import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { timestampFor } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import {
  getOperatingSystem,
  getOperatingSystemName,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { useGuestOS } from '@kubevirt-utils/resources/vmi';
import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Grid,
  GridItem,
  Popover,
  PopoverPosition,
} from '@patternfly/react-core';

import { getVMStatusIcon } from '../../../../../utils';
import CPUMemory from '../../../details/components/CPUMemory/CPUMemory';

import VirtualMachinesOverviewTabDetailsConsole from './components/VirtualMachinesOverviewTabDetailsConsole';
import VirtualMachinesOverviewTabDetailsTitle from './components/VirtualMachinesOverviewTabDetailsTitle';

import './virtual-machines-overview-tab-details.scss';

type VirtualMachinesOverviewTabDetailsProps = {
  vm: V1VirtualMachine;
};

const VirtualMachinesOverviewTabDetails: React.FC<VirtualMachinesOverviewTabDetailsProps> = ({
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { vmi } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);
  const [guestAgentData] = useGuestOS(vmi);
  const Icon = getVMStatusIcon(vm?.status?.printableStatus);

  const timestamp = timestampFor(
    new Date(vm?.metadata?.creationTimestamp),
    new Date(Date.now()),
    true,
  );

  return (
    <div className="VirtualMachinesOverviewTabDetails--details">
      <Card>
        <VirtualMachinesOverviewTabDetailsTitle vm={vm} />
        <Divider />
        <CardBody isFilled>
          <Grid>
            <GridItem span={6}>
              <DescriptionList isHorizontal>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
                  <DescriptionListDescription> {vm?.metadata?.name}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Popover
                      headerContent={<div>{vm?.status?.printableStatus}</div>}
                      bodyContent={
                        <div>
                          {t('Virtual Machine is currently ')} {vm?.status?.printableStatus}
                        </div>
                      }
                      position={PopoverPosition.right}
                    >
                      <span>
                        <Icon /> {vm?.status?.printableStatus}
                      </span>
                    </Popover>
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
                  <DescriptionListDescription>{timestamp}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('OS')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {getOperatingSystemName(vm) || getOperatingSystem(vm) || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Host')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {guestAgentData?.hostname ?? (
                      <MutedTextSpan text={t('Guest agent is required')} />
                    )}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Template')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {vm?.metadata?.labels?.['vm.kubevirt.io/template'] || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </GridItem>
            <GridItem span={6}>
              <div className="right-column">
                <div className="title">{t('CPU | Memory')}</div>
                <CPUMemory vm={vm} />
              </div>
              <VirtualMachinesOverviewTabDetailsConsole vmi={vmi} />
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
    </div>
  );
};

export default VirtualMachinesOverviewTabDetails;
