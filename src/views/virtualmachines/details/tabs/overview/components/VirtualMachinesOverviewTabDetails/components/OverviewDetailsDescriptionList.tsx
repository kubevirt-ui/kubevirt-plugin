import { type FC, useMemo } from 'react';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
  type V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import NUMABadge from '@kubevirt-utils/components/badges/NUMABadge/NUMABadge';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import { getCPUMemoryTitle } from '@kubevirt-utils/components/CPUMemory/utils';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import GuestAgentIsRequiredText from '@kubevirt-utils/components/GuestAgentIsRequiredText/GuestAgentIsRequiredText';
import { timestampFor } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import useCurrentTime from '@kubevirt-utils/hooks/useCurrentTime';
import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInstanceTypeMatcher, hasNUMAConfiguration } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getOSLabel } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { getOSNameFromGuestAgent } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { DescriptionList, Flex, pluralize, Skeleton } from '@patternfly/react-core';

import InstanceTypeDescription from './InstanceTypeDescription';
import OverviewDetailsIdentityItems from './OverviewDetailsIdentityItems';
import TemplateDescription from './TemplateDescription';

type OverviewDetailsDescriptionListProps = {
  cpuMemoryVM: V1VirtualMachine;
  guestAgentData: V1VirtualMachineInstanceGuestAgentInfo;
  isLoading: boolean;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const OverviewDetailsDescriptionList: FC<OverviewDetailsDescriptionListProps> = ({
  cpuMemoryVM,
  guestAgentData,
  isLoading,
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

  const hostname = useMemo(() => {
    if (isLoading) {
      return <Skeleton />;
    }
    return guestAgentData?.hostname ?? <GuestAgentIsRequiredText vmi={vmi} />;
  }, [isLoading, guestAgentData, vmi]);

  const osName = useMemo(() => {
    if (isLoading) {
      return <Skeleton />;
    }
    if (!isEmpty(guestAgentData)) {
      return getOSNameFromGuestAgent(guestAgentData);
    }
    return getOSLabel(vm) ?? <GuestAgentIsRequiredText vmi={vmi} />;
  }, [isLoading, guestAgentData, vmi, vm]);

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
        descriptionData={osName}
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
        descriptionHeader={getCPUMemoryTitle(t)}
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
        descriptionData={hostname}
        descriptionHeader={t('Hostname')}
      />
    </DescriptionList>
  );
};

export default OverviewDetailsDescriptionList;
