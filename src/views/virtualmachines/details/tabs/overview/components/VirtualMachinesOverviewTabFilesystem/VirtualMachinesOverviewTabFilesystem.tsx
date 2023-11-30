import React, { FC } from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardBody, Divider } from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import useFilesystemListColumns from '../../../configuration/storage/components/hooks/useFilesystemListColumns';

import FilesystemRow from './VirtualMachinesOverviewTabFilesystemRow';
import FilesystemListTitle from './VirtualMachinesOverviewTabFilesystemTitle';

type VirtualMachinesOverviewTabFilesystemProps = {
  guestAgentData: V1VirtualMachineInstanceGuestAgentInfo;
  guestAgentDataLoaded: boolean;
  vm: V1VirtualMachine;
};

const VirtualMachinesOverviewTabFilesystem: FC<VirtualMachinesOverviewTabFilesystemProps> = ({
  guestAgentData,
  guestAgentDataLoaded,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const isVMRunning = isRunning(vm);
  const columns = useFilesystemListColumns();
  const fileSystems = guestAgentData?.fsInfo?.disks || [];

  return (
    <Card>
      <FilesystemListTitle />
      <Divider />
      <CardBody isFilled>
        <VirtualizedTable
          NoDataEmptyMsg={() =>
            !guestAgentData && isVMRunning
              ? t('Guest agent is required')
              : t('VirtualMachine is not running')
          }
          columns={columns}
          data={fileSystems}
          loaded={guestAgentDataLoaded}
          loadError={null}
          Row={FilesystemRow}
          unfilteredData={fileSystems}
        />
      </CardBody>
    </Card>
  );
};

export default VirtualMachinesOverviewTabFilesystem;
