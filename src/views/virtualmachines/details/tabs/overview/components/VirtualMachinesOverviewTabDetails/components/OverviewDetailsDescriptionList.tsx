// Extracted from VirtualMachinesOverviewTabDetails.tsx
// Root: src/views/virtualmachines/details/tabs/overview/components/VirtualMachinesOverviewTabDetails/VirtualMachinesOverviewTabDetails.tsx

import React, { type FC, type ReactNode, useMemo } from 'react';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
  type V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import NUMABadge from '@kubevirt-utils/components/badges/NUMABadge/NUMABadge';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import GuestAgentIsRequiredText from '@kubevirt-utils/components/GuestAgentIsRequiredText/GuestAgentIsRequiredText';
import { timestampFor } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import useCurrentTime from '@kubevirt-utils/hooks/useCurrentTime';
import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInstanceTypeMatcher, hasNUMAConfiguration } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getOSNameFromGuestAgent } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { DescriptionList, Flex, pluralize, Skeleton } from '@patternfly/react-core';

import InstanceTypeDescription from './InstanceTypeDescription';
import OverviewDetailsIdentityItems from './OverviewDetailsIdentityItems';
import TemplateDescription from './TemplateDescription';

type GuestAgentDisplay = {
  fallback?: ReactNode;
  hostname?: string;
  osName?: string;
};

type OverviewDetailsDescriptionListProps = {
  cpuMemoryVM: V1VirtualMachine;
  error: Error;
  guestAgentData: V1VirtualMachineInstanceGuestAgentInfo;
  guestAgentDataLoaded: boolean;
  loaded: boolean;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const OverviewDetailsDescriptionList: FC<OverviewDetailsDescriptionListProps> = ({
  cpuMemoryVM,
  error,
  guestAgentData,
  guestAgentDataLoaded,
  loaded,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);
  const currentTime = useCurrentTime();

  const timestamp = timestampFor(
    new Date(vm?.metadata?.creationTimestamp),
    new Date(currentTime),
    true,
  );

  const timestampPluralized =
    typeof timestamp === 'object' ? pluralize(timestamp.value, timestamp.time) : timestamp;

  const { fallback, hostname, osName } = useMemo((): GuestAgentDisplay => {
    const isLoadingVMI = !loaded && !error;
    if (!guestAgentDataLoaded || isLoadingVMI) {
      return { fallback: <Skeleton /> };
    }
    if (!isEmpty(guestAgentData)) {
      return {
        hostname: guestAgentData?.hostname,
        osName: getOSNameFromGuestAgent(guestAgentData),
      };
    }
    return { fallback: <GuestAgentIsRequiredText vmi={vmi} /> };
  }, [loaded, error, guestAgentDataLoaded, guestAgentData, vmi]);

  return (
    <DescriptionList isHorizontal>
      <OverviewDetailsIdentityItems
        timestamp={timestamp}
        timestampPluralized={timestampPluralized}
        treeViewFoldersEnabled={treeViewFoldersEnabled}
        vm={vm}
        vmi={vmi}
      />
      <DescriptionItem
        data-test="virtual-machine-overview-details-os"
        descriptionData={osName ?? fallback}
        descriptionHeader={t('Operating system')}
      />
      <DescriptionItem
        data-test="virtual-machine-overview-details-cpu-memory"
        descriptionData={
          <Flex>
            <CPUMemory vm={cpuMemoryVM ?? vm} vmi={vmi} />
            {hasNUMAConfiguration(cpuMemoryVM) && <NUMABadge />}
          </Flex>
        }
        descriptionHeader={t('CPU | Memory')}
      />
      <DescriptionItem
        descriptionData={guestAgentData?.timezone?.split(',')[0] ?? NO_DATA_DASH}
        descriptionHeader={t('Time zone')}
      />
      {getInstanceTypeMatcher(vm) ? (
        <InstanceTypeDescription vm={vm} />
      ) : (
        <TemplateDescription vm={vm} />
      )}
      <DescriptionItem
        data-test="virtual-machine-overview-details-host"
        descriptionData={hostname ?? fallback}
        descriptionHeader={t('Hostname')}
      />
    </DescriptionList>
  );
};

export default OverviewDetailsDescriptionList;
