import React, { FC, useMemo } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import ArchitectureLabel from '@kubevirt-utils/components/ArchitectureLabel/ArchitectureLabel';
import NUMABadge from '@kubevirt-utils/components/badges/NUMABadge/NUMABadge';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import GuestAgentIsRequiredText from '@kubevirt-utils/components/GuestAgentIsRequiredText/GuestAgentIsRequiredText';
import { timestampFor } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel, getName, getVMStatus } from '@kubevirt-utils/resources/shared';
import {
  getArchitecture,
  getInstanceTypeMatcher,
  hasNUMAConfiguration,
} from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getOSNameFromGuestAgent } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  Divider,
  Flex,
  Grid,
  GridItem,
  pluralize,
  Skeleton,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';
import VMNotMigratableLabel from '@virtualmachines/list/components/VMNotMigratableLabel/VMNotMigratableLabel';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';
import { printableVMStatus } from '@virtualmachines/utils';

import InstanceTypeDescription from './components/InstanceTypeDescription';
import TemplateDescription from './components/TemplateDescription';
import VirtualMachineMigrationPercentage from './components/VirtualMachineMigrationPercentage';
import VirtualMachinesOverviewTabDetailsConsoleWrapper from './components/VirtualMachineOverviewTabDetailsConsoleWrapper';
import StatusPopover from './components/VirtualMachineStatusWithPopover/VirtualMachineStatusWithPopover';

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
  const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);

  const timestamp = timestampFor(
    new Date(vm?.metadata?.creationTimestamp),
    new Date(Date.now()),
    true,
  );

  const cpuMemoryVM =
    instanceTypeExpandedSpec?.metadata?.uid === vm?.metadata?.uid ? instanceTypeExpandedSpec : vm;

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
        osName: getOSNameFromGuestAgent(guestAgentData),
      };
    return {
      fallback: <GuestAgentIsRequiredText vmi={vmi} />,
    };
  }, [loaded, error, guestAgentDataLoaded, guestAgentData, vmi]);

  const vmPrintableStatus = getVMStatus(vm);

  return (
    <div className="VirtualMachinesOverviewTabDetails--details">
      <Card>
        <CardTitle className="pf-v6-u-text-color-subtle card-title">
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
              <DescriptionList isHorizontal>
                <DescriptionItem
                  descriptionData={
                    <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                      <span>{getName(vm)}</span>
                      <ArchitectureLabel architecture={getArchitecture(vm)} />
                    </Flex>
                  }
                  data-test-id="virtual-machine-overview-details-name"
                  descriptionHeader={t('Name')}
                />
                {treeViewFoldersEnabled && (
                  <DescriptionItem
                    data-test-id="virtual-machine-overview-details-folder"
                    descriptionData={getLabel(vm, VM_FOLDER_LABEL) || NO_DATA_DASH}
                    descriptionHeader={t('Folder')}
                  />
                )}
                <DescriptionItem
                  descriptionData={
                    <Split hasGutter isWrappable>
                      <SplitItem>
                        <StatusPopover vm={vm} vmi={vmi} />
                        {vmPrintableStatus === printableVMStatus.Migrating && (
                          <VirtualMachineMigrationPercentage vm={vm} />
                        )}
                      </SplitItem>
                      <VMNotMigratableLabel vm={vm} />
                    </Split>
                  }
                  data-test-id="virtual-machine-overview-details-status"
                  descriptionHeader={t('Status')}
                />
                <DescriptionItem
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
                <DescriptionItem
                  data-test-id="virtual-machine-overview-details-os"
                  descriptionData={osName ?? fallback}
                  descriptionHeader={t('Operating system')}
                />
                <DescriptionItem
                  descriptionData={
                    <Flex>
                      <CPUMemory vm={cpuMemoryVM || vm} vmi={vmi} />
                      {hasNUMAConfiguration(cpuMemoryVM) && <NUMABadge />}
                    </Flex>
                  }
                  descriptionHeader={t('CPU | Memory')}
                />
                <DescriptionItem
                  data-test-id="virtual-machine-overview-details-timezone"
                  descriptionData={guestAgentData?.timezone?.split(',')[0] || NO_DATA_DASH}
                  descriptionHeader={t('Time zone')}
                />
                {getInstanceTypeMatcher(vm) ? (
                  <InstanceTypeDescription vm={vm} />
                ) : (
                  <TemplateDescription vm={vm} />
                )}
                <DescriptionItem
                  data-test-id="virtual-machine-overview-details-host"
                  descriptionData={hostname ?? fallback}
                  descriptionHeader={t('Hostname')}
                />
              </DescriptionList>
            </GridItem>
            <GridItem span={1} />
            <GridItem span={5}>
              <div className="right-column">
                <div className="title">{t('VNC console')}</div>
                <VirtualMachinesOverviewTabDetailsConsoleWrapper vmi={vmi} />
              </div>
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
    </div>
  );
};

export default VirtualMachinesOverviewTabDetails;
