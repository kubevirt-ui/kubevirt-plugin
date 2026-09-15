import { type FC } from 'react';
import FirstItemListPopover from 'src/views/virtualmachines/list/components/FirstItemListPopover/FirstItemListPopover';

import { type V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMIIPAddressesWithName } from '@kubevirt-utils/resources/vmi';

type IPAddressProps = {
  vmi: V1VirtualMachineInstance;
};

const IPAddress: FC<IPAddressProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const ipAddressesWithNames = getVMIIPAddressesWithName(vmi);

  return <FirstItemListPopover headerContent={t('IP addresses')} items={ipAddressesWithNames} />;
};

export default IPAddress;
