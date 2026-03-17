import React, { FC } from 'react';

import { V1PciHostDevice } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Flex, PageSection, PopoverPosition, Title } from '@patternfly/react-core';

import useHCPermittedHostDevices from './hooks/useHCPermittedHostDevices';
import HardwareDevicesPageTable from './HardwareDevicesPageTable';

const HardwareDevicesPage: FC<any> = (props) => {
  const { t } = useKubevirtTranslation();
  const { hcError, hcLoaded, permittedHostDevices } = useHCPermittedHostDevices();

  const pages = [
    {
      component: (pageProps) => (
        <PageSection hasBodyWrapper={false}>
          <Bullseye>
            <HardwareDevicesPageTable {...pageProps} />
          </Bullseye>
        </PageSection>
      ),
      href: '',
      name: t('PCI Host devices'),
      pageData: {
        devices: permittedHostDevices?.pciHostDevices?.map(
          (device: V1PciHostDevice & { pciDeviceSelector: string }) => ({
            ...device,
            selector: device?.pciVendorSelector || device?.pciDeviceSelector,
          }),
        ),
        error: hcError,
        loaded: hcLoaded,
      },
    },
    {
      component: (pageProps) => (
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
          <Title headingLevel="h1">{t('Hardware Devices')}</Title>
          <HelpTextIcon
            bodyContent={t(
              'Various types of hardware devices are assigned to virtual machines in the cluster',
            )}
            position={PopoverPosition.right}
            size="headingXl"
          />
        </Flex>
      </PageSection>
      <HorizontalNav {...props} match={props.match} pages={pages} />
    </div>
  );
};

export default HardwareDevicesPage;
