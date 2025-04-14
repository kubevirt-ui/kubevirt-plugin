import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Popover, PopoverPosition } from '@patternfly/react-core';

import './VMIPAddresses.scss';

type VMIPProps = {
  ipAddresses: string[];
};

const VMIP: FC<VMIPProps> = ({ ipAddresses }) => {
  const { t } = useKubevirtTranslation();
  const numIPs = ipAddresses?.length;
  const isMoreThenOneIP = numIPs > 1;

  return (
    <div className="kv-vm-ips--main">
      <div>{ipAddresses?.[0]}</div>
      {isMoreThenOneIP && (
        <Popover
          bodyContent={
            Array.isArray(ipAddresses) && ipAddresses?.map((ip) => <div key={ip}>{ip}</div>)
          }
          hasAutoWidth
          headerContent={<div>{t('IP Addresses ({{ips}})', { ips: numIPs })}</div>}
          position={PopoverPosition.top}
        >
          <Button className="kv-vm-ips--more-button" variant={ButtonVariant.link}>
            {t('+{{ips}} more', { ips: numIPs - 1 })}
          </Button>
        </Popover>
      )}
    </div>
  );
};

export default VMIP;
