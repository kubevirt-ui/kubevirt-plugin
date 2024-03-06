import React, { FC, useMemo } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import GuestAgentIsRequiredText from '@kubevirt-utils/components/GuestAgentIsRequiredText/GuestAgentIsRequiredText';
import { timestampFor } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { getInstanceTypeMatcher, getMachineType } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getOsNameFromGuestAgent } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
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

import InstanceTypeDescription from './components/InstanceTypeDescription';
import MigrationProgressPopover from './components/MigrationProgressPopover/MigrationProgressPopover';
import StatusPopoverButton from './components/StatusPopoverButton/StatusPopoverButton';
import TemplateDescription from './components/TemplateDescription';
import VirtualMachineMigrationPercentage from './components/VirtualMachineMigrationPercentage';
import VirtualMachineOverviewStatus from './components/VirtualMachineOverviewStatus/VirtualMachineOverviewStatus';
import VirtualMachinesOverviewTabDetailsConsole from './components/VirtualMachinesOverviewTabDetailsConsole';

import './virtual-machines-overview-tab-details.scss';

type VirtualMachinesOverviewTabDetailsProps = {
  error: Error;
  guestAgentData: V1VirtualMachineInstanceGuestAgentInfo;
  guestAgentDataLoaded: boolean;
  instanceTypeExpandedSpec: V1VirtualMachine;
  loaded: boolean;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinesOverviewTabDetails: FC<VirtualMachinesOverviewTabDetailsProps> = ({
  error,
  guestAgentData,
  guestAgentDataLoaded,
  instanceTypeExpandedSpec,
  loaded,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();

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
          <Link
            to={createURL(
              `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Details}`,
              location?.pathname,
            )}
          >
            {t('Details')}
          </Link>
        </CardTitle>
        <Divider />
        <CardBody isFilled>
          <Grid>
            <GridItem span={5}>
              <DescriptionList className="pf-c-description-list" isHorizontal>
                <VirtualMachineDescriptionItem
                  data-test-id="virtual-machine-overview-details-name"
                  descriptionData={getName(vm)}
                  descriptionHeader={t('Name')}
                />
                <VirtualMachineDescriptionItem
                  descriptionData={
                    <Split hasGutter isWrappable>
                      <SplitItem>
                        {vmPrintableStatus !== printableVMStatus.Migrating ? (
                          <VirtualMachineOverviewStatus vmPrintableStatus={vmPrintableStatus} />
                        ) : (
                          <>
                            <MigrationProgressPopover vmi={vmi}>
                              <StatusPopoverButton vmPrintableStatus={vmPrintableStatus} />
                            </MigrationProgressPopover>
                            <VirtualMachineMigrationPercentage vm={vm} />
                          </>
                        )}
                      </SplitItem>
                      <VMNotMigratableLabel vm={vm} />
                    </Split>
                  }
                  data-test-id="virtual-machine-overview-details-status"
                  descriptionHeader={t('Status')}
                />
                <VirtualMachineDescriptionItem
                  descriptionData={
                    timestamp !== NO_DATA_DASH ? (
                      <>
                        <Timestamp simple timestamp={vm?.metadata?.creationTimestamp} /> (
                        {t('{{timestampPluralized}} ago', { timestampPluralized })})
                      </>
                    ) : (
                      NO_DATA_DASH
                    )
                  }
                  data-test-id="virtual-machine-overview-details-created"
                  descriptionHeader={t('Created')}
                />
                <VirtualMachineDescriptionItem
                  data-test-id="virtual-machine-overview-details-os"
                  descriptionData={osName ?? fallback}
                  descriptionHeader={t('Operating system')}
                />
                <VirtualMachineDescriptionItem
                  descriptionData={<CPUMemory vm={instanceTypeExpandedSpec || vm} vmi={vmi} />}
                  descriptionHeader={t('CPU | Memory')}
                />
                <VirtualMachineDescriptionItem
                  data-test-id="virtual-machine-overview-details-timezone"
                  descriptionData={guestAgentData?.timezone?.split(',')[0] || NO_DATA_DASH}
                  descriptionHeader={t('Time zone')}
                />
                {getInstanceTypeMatcher(vm) ? (
                  <InstanceTypeDescription vm={vm} />
                ) : (
                  <TemplateDescription vm={vm} />
                )}
                <VirtualMachineDescriptionItem
                  data-test-id="virtual-machine-overview-details-host"
                  descriptionData={hostname ?? fallback}
                  descriptionHeader={t('Hostname')}
                />
                <VirtualMachineDescriptionItem
                  bodyContent={t(
                    'The machine type defines the virtual hardware configuration while the operating system name and version refer to the hypervisor.',
                  )}
                  data-test-id="virtual-machine-overview-details-machine-type"
                  descriptionData={getMachineType(vm) || NO_DATA_DASH}
                  descriptionHeader={t('Machine type')}
                  isPopover
                />
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
