import * as React from 'react';
import FirstItemListPopover from 'src/views/virtualmachines/list/components/FirstItemListPopover/FirstItemListPopover';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMIIPAddresses } from '@kubevirt-utils/resources/vmi';

type IPProps = {
  vmi: V1VirtualMachineInstance;
};

const IP: React.FC<IPProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const ipAddresses = getVMIIPAddresses(vmi);

  return <FirstItemListPopover headerContent={t('IP addresses')} items={ipAddresses} />;
};

export default IP;
