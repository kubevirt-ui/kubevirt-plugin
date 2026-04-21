import React, { FC } from 'react';
import { TFunction } from 'i18next';
import FirstItemListPopover from 'src/views/virtualmachines/list/components/FirstItemListPopover/FirstItemListPopover';

import InlineCodeClipboardCopy from '@kubevirt-utils/components/Consoles/components/CloudInitCredentials/InlineCodeClipboardCopy';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import useFQDN from '@kubevirt-utils/hooks/useFQDN/useFQDN';
import useIsFQDNEnabled from '@kubevirt-utils/hooks/useFQDN/useIsFQDNEnabled';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getPrintableNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { removeLinkLocalIPV6 } from '@kubevirt-utils/utils/utils';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
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

const NameCell: FC<{ row: InterfacesData }> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  const fqdn = useFQDN(row?.network?.name, row?.vm);
  const isFQDNEnabled = useIsFQDNEnabled();

  const popoverFields = {
    [t('Model')]: row?.iface?.model,
    [t('Name')]: row?.network?.name,
    [t('Network')]: row?.network?.multus?.networkName ?? t('Pod networking'),
    [t('Type')]: getPrintableNetworkInterfaceType(row?.iface),
  };

  return (
    <div data-test={`network-interface-${row?.network?.name}`}>
      <DescriptionList>
        <Popover
          bodyContent={(hide) => (
            <PopoverContentWithLightspeedButton
              content={
                <DescriptionList isHorizontal>
                  {Object.entries(popoverFields).map(([key, value]) => (
                    <DescriptionListGroup key={key}>
                      <DescriptionListTerm>{key}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {value ?? NO_DATA_DASH}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  ))}
                  {isFQDNEnabled && fqdn && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t('FQDN')}</DescriptionListTerm>
                      <DescriptionListDescription>
                        <InlineCodeClipboardCopy clipboardText={fqdn} />
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  )}
                </DescriptionList>
              }
              hide={hide}
              promptType={OLSPromptType.VM_NETWORKS}
            />
          )}
          className="VirtualMachinesOverviewTabInterfaces--popover"
          hasAutoWidth
          position={PopoverPosition.left}
        >
          <DescriptionListTermHelpTextButton>{row?.iface?.name}</DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionList>
    </div>
  );
};

const IpAddressCell: FC<{ row: InterfacesData }> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  const ipAddresses = removeLinkLocalIPV6(row?.ipAddresses ?? []);

  return (
    <div data-test={`network-interface-ip-${row?.network?.name}`}>
      <FirstItemListPopover
        headerContent={t('IP addresses')}
        includeCopyFirstItem
        items={ipAddresses}
      />
    </div>
  );
};

export const getOverviewNetworkInterfacesColumns = (
  t: TFunction,
): ColumnConfig<InterfacesData, undefined>[] => [
  {
    key: 'name',
    label: t('Name'),
    renderCell: (row) => <NameCell row={row} />,
  },
  {
    key: 'ip',
    label: t('IP address'),
    renderCell: (row) => <IpAddressCell row={row} />,
  },
];

export const getOverviewNetworkInterfaceRowId = (row: InterfacesData): string =>
  `${row.network?.name ?? 'unknown'}-${row.iface?.macAddress ?? 'no-mac'}`;
