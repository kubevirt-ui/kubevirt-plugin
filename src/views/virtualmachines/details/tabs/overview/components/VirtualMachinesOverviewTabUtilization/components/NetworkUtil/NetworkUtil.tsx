import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import xbytes from 'xbytes';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ComponentReady from '@kubevirt-utils/components/Charts/ComponentReady/ComponentReady';
import { getUtilizationQueries } from '@kubevirt-utils/components/Charts/utils/queries';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Popover, Text, TextVariants } from '@patternfly/react-core';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

type NetworkUtilProps = {
  vmi: V1VirtualMachineInstance;
};

const NetworkUtil: React.FC<NetworkUtilProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const { currentTime, duration } = useDuration();
  const queries = React.useMemo(
    () => getUtilizationQueries({ obj: vmi, duration }),
    [vmi, duration],
  );
  const interfacesNames = useMemo(() => vmi?.spec?.domain?.devices?.interfaces, [vmi]);
  const [networkIn] = usePrometheusPoll({
    query: queries?.NETWORK_IN_USAGE,
    endpoint: PrometheusEndpoint?.QUERY,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
  });

  const [networkTotal] = usePrometheusPoll({
    query: queries?.NETWORK_TOTAL_BY_INTERFACE_USAGE,
    endpoint: PrometheusEndpoint?.QUERY,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
  });

  const [networkOut] = usePrometheusPoll({
    query: queries?.NETWORK_OUT_USAGE,
    endpoint: PrometheusEndpoint?.QUERY,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
  });
  const networkInterfaceTotal = Number(networkTotal?.data?.result?.[0]?.value?.[1])?.toFixed(2);
  const networkInData = +networkIn?.data?.result?.[0]?.value?.[1];
  const networkOutData = +networkOut?.data?.result?.[0]?.value?.[1];
  const totalTransferred = xbytes(networkInData + networkOutData || 0, {
    iec: true,
    fixed: 0,
  });
  const isReady = !isEmpty(networkInData) || !isEmpty(networkOutData);

  return (
    <div className="util network">
      <div className="util-upper">
        <div className="util-title">
          {t('Network Transfer')}
          <Popover
            bodyContent={
              <div>
                <Text component={TextVariants.h3}>{t('Network transfer breakdown')}</Text>
                <Text component={TextVariants.h6}>{t('Top consumer')}</Text>
                {interfacesNames?.map((networkInterface) => (
                  <div key={networkInterface?.name} className="network-popover">
                    <Link
                      to={`${getResourceUrl({
                        model: VirtualMachineModel,
                        resource: vmi,
                      })}/metrics?network=${networkInterface?.name}`}
                    >
                      {networkInterface?.name}
                    </Link>
                    {networkInterface?.name === networkInterfaceTotal ? (
                      <div className="text-muted">{`${networkInterfaceTotal} MBps`}</div>
                    ) : (
                      <div className="text-muted">
                        {networkTotal?.data?.result?.map(
                          (name) =>
                            name?.metric?.interface === networkInterface?.name &&
                            `${Number(name?.value?.[1])?.toFixed(2)} MBps`,
                        )}
                      </div>
                    )}
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
            position="bottom"
          >
            <div>
              <Button variant={ButtonVariant.link} isInline>
                {t('Breakdown by network')}
              </Button>
            </div>
          </Popover>
        </div>

        <div className="util-summary" data-test-id="util-summary-network-transfer">
          <div className="util-summary-value">{`${totalTransferred}s`}</div>
          <div className="util-summary-text text-muted network-value">
            <div>{t('Total')}</div>
          </div>
        </div>
      </div>
      <ComponentReady isReady={isReady}>
        <div className="network-metrics">
          <div className="network-metrics--row text-muted">
            <div className="network-metrics--row__sum">
              {`${xbytes(networkInData || 0, {
                fixed: 0,
              })}s`}
            </div>
            <div className="network-metrics--row__title">{t('In')}</div>
          </div>
          <div className="network-metrics--row text-muted">
            <div className="network-metrics--row__sum">
              {`${xbytes(networkOutData || 0, {
                fixed: 0,
              })}s`}
            </div>
            <div className="network-metrics--row__title">{t('Out')}</div>
          </div>
        </div>
      </ComponentReady>
    </div>
  );
};

export default NetworkUtil;
