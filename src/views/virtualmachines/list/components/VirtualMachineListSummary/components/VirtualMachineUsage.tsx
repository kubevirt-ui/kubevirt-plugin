import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Flex, FlexItem, Title } from '@patternfly/react-core';
import useVMTotalsMetrics from '@virtualmachines/list/hooks/useVMTotalsMetrics';

import VirtualMachineUsageItem from '../../VirtualMachineUsageItem/VirtualMachineUsageItem';

type VirtualMachineUsageProps = {
  vmis: V1VirtualMachineInstance[];
};

const VirtualMachineUsage: FC<VirtualMachineUsageProps> = ({ vmis }) => {
  const { t } = useKubevirtTranslation();
  const { cpuRequested, cpuUsage, memoryCapacity, memoryUsage, storageCapacity, storageUsage } =
    useVMTotalsMetrics(vmis);

  return (
    <FlexItem className="pf-v6-u-ml-md" grow={{ default: 'grow' }}>
      <Title className="vm-list-summary__title" headingLevel="h5">
        {t('Usage')}
      </Title>
      <Flex
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        spaceItems={{ default: 'spaceItemsSm' }}
      >
        <VirtualMachineUsageItem
          capacityText={`Requested of ${cpuRequested}`}
          metricName="CPU"
          usageText={cpuUsage}
        />
        <VirtualMachineUsageItem
          capacityText={`Used of ${memoryCapacity}`}
          metricName="Memory"
          usageText={memoryUsage}
        />
        <VirtualMachineUsageItem
          capacityText={`Used of ${storageCapacity}`}
          metricName="Storage"
          usageText={storageUsage}
        />
      </Flex>
    </FlexItem>
  );
};

export default VirtualMachineUsage;
