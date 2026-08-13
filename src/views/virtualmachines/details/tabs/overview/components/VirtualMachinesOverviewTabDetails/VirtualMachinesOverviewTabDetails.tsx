import React, { type FC, useMemo } from 'react';
import { Link } from 'react-router';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
  type V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import GuestAgentIsRequiredText from '@kubevirt-utils/components/GuestAgentIsRequiredText/GuestAgentIsRequiredText';
import { timestampFor } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import useCurrentTime from '@kubevirt-utils/hooks/useCurrentTime';
import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getOSNameFromGuestAgent } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Card,
  CardBody,
  CardTitle,
  Divider,
  Grid,
  GridItem,
  pluralize,
  Skeleton,
} from '@patternfly/react-core';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import DetailsLeftColumn from './components/DetailsLeftColumn';
import VirtualMachinesOverviewTabDetailsConsoleWrapper from './components/VirtualMachineOverviewTabDetailsConsoleWrapper';

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
  const currentTime = useCurrentTime(60_000);

  const timestamp = timestampFor(
    new Date(vm?.metadata?.creationTimestamp),
    new Date(currentTime),
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
  const timezone = guestAgentData?.timezone?.split(',')[0] ?? NO_DATA_DASH;

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
              <DetailsLeftColumn
                cpuMemoryVM={cpuMemoryVM}
                fallback={fallback}
                hostname={hostname}
                osName={osName}
                timestampPluralized={timestampPluralized}
                timezone={timezone}
                treeViewFoldersEnabled={treeViewFoldersEnabled}
                vm={vm}
                vmi={vmi}
                vmPrintableStatus={vmPrintableStatus}
              />
            </GridItem>
            <GridItem span={1} />
            <GridItem span={5}>
              <div className="right-column">
                <div className="title">{t('VNC console')}</div>
                <VirtualMachinesOverviewTabDetailsConsoleWrapper vm={vm} vmi={vmi} />
              </div>
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
    </div>
  );
};

export default VirtualMachinesOverviewTabDetails;
