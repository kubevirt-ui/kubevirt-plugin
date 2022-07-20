import React from 'react';
import xbytes from 'xbytes';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ComponentReady from '@kubevirt-utils/components/Charts/ComponentReady/ComponentReady';
import {
  getMultilineUtilizationQueries,
  PrometheusEndpoint,
} from '@kubevirt-utils/components/Charts/utils/queries';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';

type NetworkUtilProps = {
  vmi: V1VirtualMachineInstance;
};

const NetworkUtil: React.FC<NetworkUtilProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  const queries = React.useMemo(
    () =>
      getMultilineUtilizationQueries({
        vmName: vmi?.metadata?.name,
      }),
    [vmi],
  );
  const [networkInQuery, networkOutQuery] = queries?.NETWORK_USAGE;

  const [networkIn] = usePrometheusPoll({
    query: networkInQuery?.query,
    endpoint: PrometheusEndpoint?.QUERY,
    namespace: vmi?.metadata?.namespace,
  });

  const [networkOut] = usePrometheusPoll({
    query: networkOutQuery?.query,
    endpoint: PrometheusEndpoint?.QUERY,
    namespace: vmi?.metadata?.namespace,
  });

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
          <div className="util-title__subtitle text-muted">{t('Primary Network')}</div>
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
