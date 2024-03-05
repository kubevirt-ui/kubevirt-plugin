import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getHostname } from '@kubevirt-utils/resources/vm';
import {
  ClipboardCopy,
  ClipboardCopyVariant,
  DescriptionList,
  Divider,
} from '@patternfly/react-core';

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
      <DescriptionList className="pf-c-description-list" isHorizontal>
        <VirtualMachineDescriptionItem
          bodyContent={t(
            'The machine type defines the virtual hardware configuration while the operating system name and version refer to the hypervisor.',
          )}
          descriptionData={
            <ClipboardCopy
              clickTip={t('Copied')}
              hoverTip={t('Copy to clipboard')}
              variant={ClipboardCopyVariant.inlineCompact}
            >
              {`${getName(vm) || getHostname(vm)}.headless.${getNamespace(vm)}.svc.cluster.local`}
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
