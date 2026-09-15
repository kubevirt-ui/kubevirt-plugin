import type { FC } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
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
        <DescriptionItem
          className="VirtualMachinesOverviewTabNetworkFQDN--main"
          descriptionData={
            <ClipboardCopy
              clickTip={t('Copied')}
              hoverTip={t('Copy to clipboard')}
              variant={ClipboardCopyVariant.inlineCompact}
            >
              {getInternalFQDNURL(vm)}
            </ClipboardCopy>
          }
          descriptionHeader={t('Internal FQDN')}
          isPopover
        />
      </DescriptionList>
    </>
  );
};

export default VirtualMachinesOverviewTabNetworkFQDN;
