import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Button, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import useHCPermittedHostDevices from './hooks/useHCPermittedHostDevices';
import HardwareDevicesTable from './HardwareDevicesTable';

export const HardwareDevicesPage: React.FC<any> = (props) => {
  const { t } = useKubevirtTranslation();
  const permittedHostDevices = useHCPermittedHostDevices();

  const pages = [
    {
      href: '',
      name: t('PCI Host devices'),
      component: (pageProps) => (
        <div className="co-m-pane__body">
          <Bullseye>
            <HardwareDevicesTable {...pageProps} />
          </Bullseye>
        </div>
      ),
      pageData: {
        devices: permittedHostDevices?.pciHostDevices,
      },
    },
    {
      href: 'mediated',
      name: t('Mediated devices'),
      component: (pageProps) => (
        <div className="co-m-pane__body">
          <Bullseye>
            <HardwareDevicesTable {...pageProps} />
          </Bullseye>
        </div>
      ),
      pageData: {
        devices: permittedHostDevices?.mediatedDevices,
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
            <Button variant="plain" aria-label="Action">
              <HelpIcon noVerticalAlign />
            </Button>
          </Popover>
        </h1>
      </div>
      <HorizontalNav {...props} pages={pages} match={props.match} />
    </div>
  );
};
