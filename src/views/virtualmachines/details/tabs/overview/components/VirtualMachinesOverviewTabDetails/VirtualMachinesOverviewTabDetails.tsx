import * as React from 'react';

import { modelToGroupVersionKind, TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { timestampFor } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { LABEL_USED_TEMPLATE_NAMESPACE } from '@kubevirt-utils/resources/template';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { VM_TEMPLATE_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { useGuestOS } from '@kubevirt-utils/resources/vmi';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
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
  Skeleton,
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
  const [guestAgentData, loaded] = useGuestOS(vmi);
  const Icon = getVMStatusIcon(vm?.status?.printableStatus);
  const templateName = getLabel(vm, VM_TEMPLATE_ANNOTATION);
  const templateNamespace = getLabel(vm, LABEL_USED_TEMPLATE_NAMESPACE);
  const None = <MutedTextSpan text={t('None')} />;

  const timestamp = timestampFor(
    new Date(vm?.metadata?.creationTimestamp),
    new Date(Date.now()),
    true,
  );

  const guestAgentIsRequired = <MutedTextSpan text={t('Guest agent is required')} />;

  const osName =
    (guestAgentData?.os?.prettyName || guestAgentData?.os?.name) ?? guestAgentIsRequired;

  const hostname = guestAgentData?.hostname ?? guestAgentIsRequired;

  return (
    <div className="VirtualMachinesOverviewTabDetails--details">
      <Card>
        <VirtualMachinesOverviewTabDetailsTitle vm={vm} />
        <Divider />
        <CardBody isFilled>
          <Grid>
            <GridItem span={5}>
              <DescriptionList isHorizontal>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
                  <DescriptionListDescription data-test-id="virtual-machine-overview-details-name">
                    {' '}
                    {vm?.metadata?.name}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
                  <DescriptionListDescription data-test-id="virtual-machine-overview-details-status">
                    <Popover
                      headerContent={<div>{vm?.status?.printableStatus}</div>}
                      bodyContent={
                        <div>
                          {t('VirtualMachine is currently ')} {vm?.status?.printableStatus}
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
                  <DescriptionListDescription data-test-id="virtual-machine-overview-details-created">
                    {timestamp}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Operating system')}</DescriptionListTerm>
                  <DescriptionListDescription data-test-id="virtual-machine-overview-details-os">
                    {loaded ? osName : <Skeleton />}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('CPU | Memory')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <CPUMemory vm={vm} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Hostname')}</DescriptionListTerm>
                  <DescriptionListDescription data-test-id="virtual-machine-overview-details-host">
                    {loaded ? hostname : <Skeleton />}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Template')}</DescriptionListTerm>
                  <DescriptionListDescription data-test-id="virtual-machine-overview-details-template">
                    {templateName && templateNamespace ? (
                      <ResourceLink
                        groupVersionKind={modelToGroupVersionKind(TemplateModel)}
                        name={templateName}
                        namespace={templateNamespace}
                      />
                    ) : (
                      None
                    )}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </GridItem>
            <GridItem span={1} />
            <GridItem span={5}>
              <div className="right-column">
                <div className="title">{t('VNC console')}</div>
                <VirtualMachinesOverviewTabDetailsConsole vmi={vmi} />
              </div>
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
    </div>
  );
};

export default VirtualMachinesOverviewTabDetails;
