import React, { FC, ReactNode } from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import FileSystemList from '@kubevirt-utils/components/FileSystemList/FileSystemList';
import { FileSystemData } from '@kubevirt-utils/components/FileSystemList/fileSystemListDefinition';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isGuestAgentConnected } from '@kubevirt-utils/resources/vmi';
import { Bullseye, Card, CardBody, Divider } from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import FilesystemListTitle from './VirtualMachinesOverviewTabFilesystemTitle';

type VirtualMachinesOverviewTabFilesystemProps = {
  guestAgentData: V1VirtualMachineInstanceGuestAgentInfo;
  guestAgentDataLoaded: boolean;
  guestAgentDataLoadError?: Error;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinesOverviewTabFilesystem: FC<VirtualMachinesOverviewTabFilesystemProps> = ({
  guestAgentData,
  guestAgentDataLoaded,
  guestAgentDataLoadError,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const isVMRunning = isRunning(vm);
  const isConnected = vmi && isGuestAgentConnected(vmi);
  const fileSystems: FileSystemData[] = guestAgentData?.fsInfo?.disks ?? [];

  const renderContent = (): ReactNode => {
    if (!isVMRunning) {
      return (
        <Bullseye data-test="overview-filesystem-not-running">
          <MutedTextSpan text={t('VirtualMachine is not running')} />
        </Bullseye>
      );
    }

    if (!isConnected) {
      return (
        <Bullseye data-test="overview-filesystem-no-agent">
          <MutedTextSpan text={t('Guest agent is required')} />
        </Bullseye>
      );
    }

    return (
      <FileSystemList
        data={fileSystems}
        loaded={guestAgentDataLoaded}
        loadError={guestAgentDataLoadError}
      />
    );
  };

  return (
    <Card data-test="overview-filesystem-card">
      <FilesystemListTitle />
      <Divider />
      <CardBody isFilled>{renderContent()}</CardBody>
    </Card>
  );
};

export default VirtualMachinesOverviewTabFilesystem;
