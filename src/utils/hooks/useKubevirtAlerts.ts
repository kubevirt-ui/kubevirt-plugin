import * as React from 'react';

import { KUBEVIRT } from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useAlerts from '@kubevirt-utils/hooks/useAlerts/useAlerts';
import { Alert } from '@openshift-console/dynamic-plugin-sdk';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';

import { OPERATOR_LABEL_KEY } from '../../views/clusteroverview/OverviewTab/status-card/utils/constants';

export const isKubeVirtAlert = (alert: Alert): boolean =>
  alert?.labels?.[OPERATOR_LABEL_KEY] === KUBEVIRT;

const inNamespace = (namespace: string, alert: Alert): boolean =>
  alert?.labels?.namespace === namespace;

export type UseKubevirtAlerts = () => [Alert[], boolean, unknown];

const useKubevirtAlerts: UseKubevirtAlerts = () => {
  const [activeNamespace] = useActiveNamespace();
  const { alerts, loaded, loadError } = useAlerts();
  const filteredAlerts: Alert[] = React.useMemo(() => {
    if (activeNamespace && activeNamespace !== ALL_NAMESPACES_SESSION_KEY) {
      return alerts?.filter(
        (alert) => isKubeVirtAlert(alert) && inNamespace(activeNamespace, alert),
      );
    }

    return alerts?.filter((alert) => isKubeVirtAlert(alert));
  }, [activeNamespace, alerts]);

  return [filteredAlerts, loaded, loadError];
};

export default useKubevirtAlerts;
