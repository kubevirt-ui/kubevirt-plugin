import React, { type FC, type ReactElement } from 'react';

import { type V1PciHostDevice } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Flex, PageSection, PopoverPosition, Title } from '@patternfly/react-core';

import HardwareDevicesPageTable from './HardwareDevicesPageTable';
import useHCPermittedHostDevices from './hooks/useHCPermittedHostDevices';
import { type HardwareDevicePageRow } from './utils/constants';

type HardwareDevicesPageProps = {
  match: { url: string };
};

const HardwareDevicesPage: FC<HardwareDevicesPageProps> = (_props) => {
  const { t } = useKubevirtTranslation();
  const { hcError, hcLoaded, permittedHostDevices } = useHCPermittedHostDevices();

  const pciDevices: HardwareDevicePageRow[] =
    permittedHostDevices?.pciHostDevices?.map(
      (device: V1PciHostDevice & { pciDeviceSelector: string }) => ({
        resourceName: device.resourceName ?? '',
        selector: device?.pciVendorSelector ?? device?.pciDeviceSelector ?? '',
      }),
    ) ?? [];

  const mediatedDevices: HardwareDevicePageRow[] =
    permittedHostDevices?.mediatedDevices?.map((device) => ({
      resourceName: device.resourceName ?? '',
      selector: device?.mdevNameSelector ?? '',
    })) ?? [];

  const pages = [
    {
      component: (): ReactElement => (
        <PageSection hasBodyWrapper={false}>
          <Bullseye>
            <HardwareDevicesPageTable devices={pciDevices} error={hcError} loaded={hcLoaded} />
          </Bullseye>
        </PageSection>
      ),
      href: '',
      name: t('PCI host devices'),
      pageData: {
        devices: pciDevices,
        error: hcError,
        loaded: hcLoaded,
      },
    },
    {
      component: (): ReactElement => (
        <PageSection hasBodyWrapper={false}>
          <Bullseye>
            <HardwareDevicesPageTable devices={mediatedDevices} error={hcError} loaded={hcLoaded} />
          </Bullseye>
        </PageSection>
      ),
      href: 'mediated',
      name: t('Mediated devices'),
      pageData: {
        devices: mediatedDevices,
        error: hcError,
        loaded: hcLoaded,
      },
    },
  ];

  return (
    <div>
      <PageSection>
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          <Title headingLevel="h1">{t('Hardware devices')}</Title>
          <HelpTextIcon
            bodyContent={t(
              'Various types of hardware devices are assigned to virtual machines in the cluster',
            )}
            position={PopoverPosition.right}
            size="headingXl"
          />
        </Flex>
      </PageSection>
      <HorizontalNav pages={pages} />
    </div>
  );
};

export default HardwareDevicesPage;
