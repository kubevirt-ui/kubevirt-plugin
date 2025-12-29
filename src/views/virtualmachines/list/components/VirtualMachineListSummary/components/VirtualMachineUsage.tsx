import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, CardBody, CardTitle, Flex } from '@patternfly/react-core';
import useVMTotalsMetrics from '@virtualmachines/list/hooks/useVMTotalsMetrics';

import VirtualMachineUsageItem from '../../VirtualMachineUsageItem/VirtualMachineUsageItem';

type VirtualMachineUsageProps = {
  vmis: V1VirtualMachineInstance[];
  vms: V1VirtualMachine[];
};

const VirtualMachineUsage: FC<VirtualMachineUsageProps> = ({ vmis, vms }) => {
  const { t } = useKubevirtTranslation();
  const { cpuRequested, cpuUsage, memoryCapacity, memoryUsage, storageCapacity, storageUsage } =
    useVMTotalsMetrics({ vmis, vms });

  return (
    <Card>
      <CardTitle>{t('Usage')}</CardTitle>
      <CardBody>
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          spaceItems={{ default: 'spaceItems2xl' }}
        >
          <VirtualMachineUsageItem
            capacityText={t('Requested of {{cpuRequested}}', { cpuRequested })}
            metricName={t('CPU')}
            usageText={cpuUsage}
          />
          <VirtualMachineUsageItem
            capacityText={t('Used of {{value}}', { value: memoryCapacity })}
            metricName={t('Memory')}
            usageText={memoryUsage}
          />
          <VirtualMachineUsageItem
            capacityText={t('Used of {{value}}', { value: storageCapacity })}
            metricName={t('Storage')}
            usageText={storageUsage}
          />
        </Flex>
      </CardBody>
    </Card>
  );
};

export default VirtualMachineUsage;
