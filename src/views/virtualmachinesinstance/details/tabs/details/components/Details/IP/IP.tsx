import * as React from 'react';
import FirstItemListPopover from 'src/views/virtualmachines/list/components/FirstItemListPopover/FirstItemListPopover';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMIIPAddressesWithName } from '@kubevirt-utils/resources/vmi';

type IPProps = {
  vmi: V1VirtualMachineInstance;
};

const IP: React.FC<IPProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const ipAddressesWithNames = getVMIIPAddressesWithName(vmi);

  return <FirstItemListPopover headerContent={t('IP addresses')} items={ipAddressesWithNames} />;
};

export default IP;
