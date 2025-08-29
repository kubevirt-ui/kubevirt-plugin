import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ClipboardCopy,
  ClipboardCopyVariant,
  DescriptionList,
  Divider,
} from '@patternfly/react-core';
import { getInternalFQDNURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import './virtual-machines-overview-tab-network-fqdn.scss';

type VirtualMachinesOverviewTabNetworkFQDN = {
  vm: V1VirtualMachine;
};

const VirtualMachinesOverviewTabNetworkFQDN: FC<VirtualMachinesOverviewTabNetworkFQDN> = ({
  vm,
}) => {
  const { t } = useKubevirtTranslation();

  if (!vm) return null;

  return (
    <>
      <Divider />
      <DescriptionList isHorizontal>
        <VirtualMachineDescriptionItem
          descriptionData={
            <ClipboardCopy
              clickTip={t('Copied')}
              hoverTip={t('Copy to clipboard')}
              variant={ClipboardCopyVariant.inlineCompact}
            >
              {getInternalFQDNURL(vm)}
            </ClipboardCopy>
          }
          className="VirtualMachinesOverviewTabNetworkFQDN--main"
          descriptionHeader={t('Internal FQDN')}
          isPopover
        />
      </DescriptionList>
    </>
  );
};

export default VirtualMachinesOverviewTabNetworkFQDN;
