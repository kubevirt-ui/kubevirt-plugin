import React from 'react';

import { V1PciHostDevice } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Button, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import useHCPermittedHostDevices from './hooks/useHCPermittedHostDevices';
import HardwareDevicesPageTable from './HardwareDevicesPageTable';

const HardwareDevicesPage: React.FC<any> = (props) => {
  const { t } = useKubevirtTranslation();
  const { errorHcList, loadedHcList, permittedHostDevices } = useHCPermittedHostDevices();

  const pages = [
    {
      component: (pageProps) => (
        <div className="co-m-pane__body">
          <Bullseye>
            <HardwareDevicesPageTable {...pageProps} />
          </Bullseye>
        </div>
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
        error: errorHcList,
        loaded: loadedHcList,
      },
    },
    {
      component: (pageProps) => (
        <div className="co-m-pane__body">
          <Bullseye>
            <HardwareDevicesPageTable {...pageProps} />
          </Bullseye>
        </div>
      ),
      href: 'mediated',
      name: t('Mediated devices'),
      pageData: {
        devices: permittedHostDevices?.mediatedDevices?.map((device) => ({
          ...device,
          selector: device?.mdevNameSelector,
        })),
        error: errorHcList,
        loaded: loadedHcList,
      },
    },
  ];

  return (
    <div className="co-m-list">
      <div className="co-m-nav-title">
        <h1>
          {t('Hardware Devices')}
          <Popover
            bodyContent={t(
              'Various types of hardware devices are assigned to virtual machines in the cluster',
            )}
          >
            <Button aria-label="Action" variant="plain">
              <HelpIcon noVerticalAlign />
            </Button>
          </Popover>
        </h1>
      </div>
      <HorizontalNav {...props} match={props.match} pages={pages} />
    </div>
  );
};

export default HardwareDevicesPage;
