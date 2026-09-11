import { type FC, type JSX } from 'react';

import { type V1PciHostDevice } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  HorizontalNav,
  type HorizontalNavProps,
  type NavPage,
} from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Flex, PageSection, PopoverPosition, Title } from '@patternfly/react-core';

import HardwareDevicesPageTable from './HardwareDevicesPageTable';
import useHCPermittedHostDevices from './hooks/useHCPermittedHostDevices';
import { type HardwareDevicePageRow } from './utils/constants';

type HardwareDevicesPageTableProps = {
  devices: HardwareDevicePageRow[];
  error?: Error;
  loaded: boolean;
};

type HardwareDevicesNavPage = Omit<NavPage, 'component'> & {
  component: (pageProps: HardwareDevicesPageTableProps) => JSX.Element;
  pageData: HardwareDevicesPageTableProps;
};

const HardwareDevicesPage: FC<HorizontalNavProps> = (props) => {
  const { t } = useKubevirtTranslation();
  const { hcError, hcLoaded, permittedHostDevices } = useHCPermittedHostDevices();

  const pages: HardwareDevicesNavPage[] = [
    {
      component: (pageProps: HardwareDevicesPageTableProps) => (
        <PageSection hasBodyWrapper={false}>
          <Bullseye>
            <HardwareDevicesPageTable {...pageProps} />
          </Bullseye>
        </PageSection>
      ),
      href: '',
      name: t('PCI host devices'),
      pageData: {
        devices: permittedHostDevices?.pciHostDevices?.map(
          (device: V1PciHostDevice & { pciDeviceSelector: string }) => ({
            ...device,
            selector: device?.pciVendorSelector ?? device?.pciDeviceSelector,
          }),
        ),
        error: hcError,
        loaded: hcLoaded,
      },
    },
    {
      component: (pageProps: HardwareDevicesPageTableProps) => (
        <PageSection hasBodyWrapper={false}>
          <Bullseye>
            <HardwareDevicesPageTable {...pageProps} />
          </Bullseye>
        </PageSection>
      ),
      href: 'mediated',
      name: t('Mediated devices'),
      pageData: {
        devices: permittedHostDevices?.mediatedDevices?.map((device) => ({
          ...device,
          selector: device?.mdevNameSelector,
        })),
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
      <HorizontalNav {...props} pages={pages} />
    </div>
  );
};

export default HardwareDevicesPage;
