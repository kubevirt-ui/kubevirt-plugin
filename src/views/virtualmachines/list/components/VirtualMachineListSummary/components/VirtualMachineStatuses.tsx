import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import { ERROR, OTHER } from '@overview/OverviewTab/vm-statuses-card/utils/constants';
import { getVMStatuses } from '@overview/OverviewTab/vm-statuses-card/utils/utils';
import { Card, CardBody, CardTitle, Flex } from '@patternfly/react-core';

import VirtualMachineStatus from './VirtualMachineStatus';

type VirtualMachineStatusesProps = {
  vms: V1VirtualMachine[];
};

const VirtualMachineStatuses: FC<VirtualMachineStatusesProps> = ({ vms }) => {
  const { t } = useKubevirtTranslation();
  const { otherStatusesCount, primaryStatuses } = getVMStatuses(vms || []);

  const vmsCount = vms?.length;

  return (
    <Card>
      <CardTitle>{t('Virtual Machines ({{count}})', { count: vmsCount })}</CardTitle>
      <CardBody>
        <Flex rowGap={{ default: 'rowGapMd' }} spaceItems={{ default: 'spaceItems2xl' }}>
          <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
            <VirtualMachineStatus count={primaryStatuses.Error} statusLabel={ERROR} />
            <VirtualMachineStatus count={primaryStatuses.Stopped} statusLabel={VM_STATUS.Stopped} />
          </Flex>
          <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
            <VirtualMachineStatus count={primaryStatuses.Running} statusLabel={VM_STATUS.Running} />
            <VirtualMachineStatus count={otherStatusesCount} statusLabel={OTHER} />
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default VirtualMachineStatuses;
