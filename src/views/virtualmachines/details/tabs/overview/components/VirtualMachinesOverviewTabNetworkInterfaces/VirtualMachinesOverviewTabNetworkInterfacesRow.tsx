import React, { FC } from 'react';
import FirstItemListPopover from 'src/views/virtualmachines/list/components/FirstItemListPopover/FirstItemListPopover';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getPrintableNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { TableData } from '@openshift-console/dynamic-plugin-sdk';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListTermHelpTextButton,
  Popover,
  PopoverPosition,
} from '@patternfly/react-core';

import { InterfacesData } from './utils/types';

type VirtualMachinesOverviewTabNetworkInterfacesProps = {
  activeColumnIDs: Set<string>;
  obj: InterfacesData;
};

const VirtualMachinesOverviewTabInterfacesRow: FC<
  VirtualMachinesOverviewTabNetworkInterfacesProps
> = ({ activeColumnIDs, obj }) => {
  const { t } = useKubevirtTranslation();
  const popoverFields = {
    [t('Model')]: obj?.iface?.model,
    [t('Name')]: obj?.network?.name,
    [t('Network')]: obj?.network?.multus?.networkName || t('Pod networking'),
    [t('Type')]: getPrintableNetworkInterfaceType(obj?.iface),
  };
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <div data-test-id={`network-interface-${obj?.network?.name}`}>
          <DescriptionList>
            <Popover
              bodyContent={
                <DescriptionList isHorizontal>
                  {Object.entries(popoverFields).map(([key, value]) => (
                    <DescriptionListGroup key={key}>
                      <DescriptionListTerm>{key}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {value || NO_DATA_DASH}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  ))}
                </DescriptionList>
              }
              hasAutoWidth
              position={PopoverPosition.left}
            >
              <DescriptionListTermHelpTextButton>
                {obj?.iface?.name}
              </DescriptionListTermHelpTextButton>
            </Popover>
          </DescriptionList>
        </div>
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="ip">
        <div data-test-id={`network-interface-${obj?.ipAddresses}`}>
          <FirstItemListPopover
            headerContent={'IP addresses'}
            includeCopyFirstItem
            items={obj?.ipAddresses}
          />
        </div>
      </TableData>
    </>
  );
};

export default VirtualMachinesOverviewTabInterfacesRow;
