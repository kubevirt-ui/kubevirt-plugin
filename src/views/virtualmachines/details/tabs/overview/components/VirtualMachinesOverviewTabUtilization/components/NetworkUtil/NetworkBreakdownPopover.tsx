import React, { useMemo } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Content, ContentVariants, Popover } from '@patternfly/react-core';

import { getInterfaceNetworkRate } from './utils';

type NetworkBreakdownPopoverProps = {
  networkTotal: PrometheusResponse;
  vmi: V1VirtualMachineInstance;
};

const NetworkBreakdownPopover: React.FC<NetworkBreakdownPopoverProps> = ({ networkTotal, vmi }) => {
  const { t } = useKubevirtTranslation();

  const interfacesNames = useMemo(() => vmi?.spec?.domain?.devices?.interfaces, [vmi]);

  return (
    <Popover
      bodyContent={
        <div>
          <Content component={ContentVariants.h6}>{t('Top consumer')}</Content>
          {interfacesNames?.map((networkInterface) => (
            <div className="network-popover" key={networkInterface?.name}>
              <Link
                to={`${getResourceUrl({
                  model: VirtualMachineModel,
                  resource: vmi,
                })}/metrics?network=${networkInterface?.name}`}
              >
                {networkInterface?.name}
              </Link>
              <div className="pf-v6-u-text-color-subtle">
                {getInterfaceNetworkRate(networkTotal, networkInterface?.name)}
              </div>
            </div>
          ))}
          {interfacesNames?.length > 5 && (
            <Link
              to={`${getResourceUrl({
                model: VirtualMachineModel,
                resource: vmi,
              })}/metrics?network`}
            >
              {t('View more')}
            </Link>
          )}
        </div>
      }
      headerContent={t('Network transfer breakdown')}
      position="bottom"
    >
      <div>
        <Button isInline variant={ButtonVariant.link}>
          {t('Breakdown by network')}
        </Button>
      </div>
    </Popover>
  );
};

export default NetworkBreakdownPopover;
