import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMIIPAddresses } from '@kubevirt-utils/resources/vmi';
import { Button, ButtonVariant, Popover, PopoverPosition } from '@patternfly/react-core';

type VirtualMachinesInstancesIPProps = {
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinesInstancesIP: React.FC<VirtualMachinesInstancesIPProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const ips = getVMIIPAddresses(vmi);

  return (
    <>
      <div>{ips?.[0]}</div>
      {ips?.length > 1 && (
        <Popover
          headerContent={t('IP addresses')}
          bodyContent={ips?.map((item) => (
            <div key={item}>{item}</div>
          ))}
          position={PopoverPosition.top}
          hasAutoWidth
        >
          <Button variant={ButtonVariant.link}>{`+${ips?.length - 1} more`}</Button>
        </Popover>
      )}
    </>
  );
};

export default VirtualMachinesInstancesIP;
