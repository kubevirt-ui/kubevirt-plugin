import React, { FC, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { modelToGroupVersionKind, TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import { DescriptionItemHeader } from '@kubevirt-utils/components/DescriptionItem/DescriptionItemHeader';
import GuestAgentIsRequiredText from '@kubevirt-utils/components/GuestAgentIsRequiredText/GuestAgentIsRequiredText';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { timestampFor } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { LABEL_USED_TEMPLATE_NAMESPACE } from '@kubevirt-utils/resources/template';
import { getMachineType, VM_TEMPLATE_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getOsNameFromGuestAgent } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceLink, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListTermHelpText,
  Divider,
  Grid,
  GridItem,
  pluralize,
  Skeleton,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';
import VMNotMigratableLabel from '@virtualmachines/list/components/VMNotMigratableLabel/VMNotMigratableLabel';
import { printableVMStatus } from '@virtualmachines/utils';

import MigrationProgressPopover from './components/MigrationProgressPopover/MigrationProgressPopover';
import StatusPopoverButton from './components/StatusPopoverButton/StatusPopoverButton';
import VirtualMachineOverviewStatus from './components/VirtualMachineOverviewStatus/VirtualMachineOverviewStatus';
import VirtualMachinesOverviewTabDetailsConsole from './components/VirtualMachinesOverviewTabDetailsConsole';

import './virtual-machines-overview-tab-details.scss';

type VirtualMachinesOverviewTabDetailsProps = {
  error: Error;
  guestAgentData: V1VirtualMachineInstanceGuestAgentInfo;
  guestAgentDataLoaded: boolean;
  loaded: boolean;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinesOverviewTabDetails: FC<VirtualMachinesOverviewTabDetailsProps> = ({
  error,
  guestAgentData,
  guestAgentDataLoaded,
  loaded,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const templateName = getLabel(vm, VM_TEMPLATE_ANNOTATION);
  const templateNamespace = getLabel(vm, LABEL_USED_TEMPLATE_NAMESPACE);
  const None = <MutedTextSpan text={t('None')} />;

  const timestamp = timestampFor(
    new Date(vm?.metadata?.creationTimestamp),
    new Date(Date.now()),
    true,
  );

  const timestampPluralized = pluralize(timestamp['value'], timestamp['time']);

  const { fallback, hostname, osName } = useMemo(() => {
    const isLoadingVMI = !loaded && !error;
    if (!guestAgentDataLoaded || isLoadingVMI)
      return {
        fallback: <Skeleton />,
      };
    if (!isEmpty(guestAgentData))
      return {
        hostname: guestAgentData?.hostname,
        osName: getOsNameFromGuestAgent(guestAgentData),
      };
    return {
      fallback: <GuestAgentIsRequiredText vmi={vmi} />,
    };
  }, [loaded, error, guestAgentDataLoaded, guestAgentData, vmi]);

  const vmPrintableStatus = vm?.status?.printableStatus;

  return (
    <div className="VirtualMachinesOverviewTabDetails--details">
      <Card>
        <CardTitle className="text-muted card-title">
          <Link to={createURL('details', location?.pathname)}>{t('Details')}</Link>
        </CardTitle>
        <Divider />
        <CardBody isFilled>
          <Grid>
            <GridItem span={5}>
              <DescriptionList isHorizontal>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
                  <DescriptionListDescription data-test-id="virtual-machine-overview-details-name">
                    {vm?.metadata?.name || NO_DATA_DASH}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
                  <DescriptionListDescription data-test-id="virtual-machine-overview-details-status">
                    <Split hasGutter isWrappable>
                      <SplitItem>
                        {vmPrintableStatus !== printableVMStatus.Migrating ? (
                          <VirtualMachineOverviewStatus vmPrintableStatus={vmPrintableStatus} />
                        ) : (
                          <MigrationProgressPopover vmi={vmi}>
                            <StatusPopoverButton vmPrintableStatus={vmPrintableStatus} />
                          </MigrationProgressPopover>
                        )}
                      </SplitItem>
                      <VMNotMigratableLabel vm={vm} />
                    </Split>
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
                  <DescriptionListDescription data-test-id="virtual-machine-overview-details-created">
                    {timestamp !== NO_DATA_DASH ? (
                      <>
                        <Timestamp simple timestamp={vm?.metadata?.creationTimestamp} /> (
                        {t('{{timestampPluralized}} ago', { timestampPluralized })})
                      </>
                    ) : (
                      NO_DATA_DASH
                    )}
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
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Time zone')}</DescriptionListTerm>
                  <DescriptionListDescription data-test-id="virtual-machine-overview-details-timezone">
                    {guestAgentData?.timezone?.split(',')[0] || NO_DATA_DASH}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTermHelpText>
                    <DescriptionItemHeader
                      bodyContent={t(
                        'The machine type defines the virtual hardware configuration while the operating system name and version refer to the hypervisor.',
                      )}
                      descriptionHeader={t('Machine type')}
                      isPopover
                    />
                  </DescriptionListTermHelpText>
                  <DescriptionListDescription data-test-id="virtual-machine-overview-details-timezone">
                    {getMachineType(vm) || NO_DATA_DASH}
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
