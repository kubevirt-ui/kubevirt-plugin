import React, { FC, useMemo } from 'react';

import { modelToGroupVersionKind, TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import GuestAgentIsRequiredText from '@kubevirt-utils/components/GuestAgentIsRequiredText/GuestAgentIsRequiredText';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { timestampFor } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { LABEL_USED_TEMPLATE_NAMESPACE } from '@kubevirt-utils/resources/template';
import { useVMIAndPodsForVM, VM_TEMPLATE_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getOsNameFromGuestAgent, useGuestOS } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
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
  pluralize,
  Skeleton,
} from '@patternfly/react-core';

import { printableVMStatus } from '../../../../../utils';
import CPUMemory from '../../../details/components/CPUMemory/CPUMemory';

import MigrationProgressPopover from './components/MigrationProgressPopover/MigrationProgressPopover';
import StatusPopoverButton from './components/StatusPopoverButton/StatusPopoverButton';
import VirtualMachineOverviewStatus from './components/VirtualMachineOverviewStatus/VirtualMachineOverviewStatus';
import VirtualMachinesOverviewTabDetailsConsole from './components/VirtualMachinesOverviewTabDetailsConsole';
import VirtualMachinesOverviewTabDetailsTitle from './components/VirtualMachinesOverviewTabDetailsTitle';

import './virtual-machines-overview-tab-details.scss';

type VirtualMachinesOverviewTabDetailsProps = {
  vm: V1VirtualMachine;
};

const VirtualMachinesOverviewTabDetails: FC<VirtualMachinesOverviewTabDetailsProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { vmi, loaded } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);
  const [guestAgentData, loadedGuestAgent] = useGuestOS(vmi);
  const templateName = getLabel(vm, VM_TEMPLATE_ANNOTATION);
  const templateNamespace = getLabel(vm, LABEL_USED_TEMPLATE_NAMESPACE);
  const None = <MutedTextSpan text={t('None')} />;

  const timestamp = timestampFor(
    new Date(vm?.metadata?.creationTimestamp),
    new Date(Date.now()),
    true,
  );

  const timestampPluralized = pluralize(timestamp['value'], timestamp['time']);

  const { osName, hostname, fallback } = useMemo(() => {
    if (!loadedGuestAgent || !loaded)
      return {
        fallback: <Skeleton />,
      };
    if (!isEmpty(guestAgentData))
      return {
        osName: getOsNameFromGuestAgent(guestAgentData),
        hostname: guestAgentData?.hostname,
      };
    return {
      fallback: <GuestAgentIsRequiredText vmi={vmi} />,
    };
  }, [guestAgentData, loadedGuestAgent, vmi, loaded]);

  const vmPrintableStatus = vm?.status?.printableStatus;

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
                    {vm?.metadata?.name || NO_DATA_DASH}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
                  <DescriptionListDescription data-test-id="virtual-machine-overview-details-status">
                    {vmPrintableStatus !== printableVMStatus.Migrating ? (
                      <VirtualMachineOverviewStatus vmPrintableStatus={vmPrintableStatus} />
                    ) : (
                      <MigrationProgressPopover vmi={vmi}>
                        <StatusPopoverButton vmPrintableStatus={vmPrintableStatus} />
                      </MigrationProgressPopover>
                    )}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
                  <DescriptionListDescription data-test-id="virtual-machine-overview-details-created">
                    {timestamp !== NO_DATA_DASH
                      ? t('{{timestampPluralized}} ago', { timestampPluralized })
                      : NO_DATA_DASH}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Operating system')}</DescriptionListTerm>
                  <DescriptionListDescription data-test-id="virtual-machine-overview-details-os">
                    {osName ?? fallback}
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
                    {hostname ?? fallback}
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
