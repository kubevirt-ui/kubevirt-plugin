import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { SimplifiedAlerts } from '@kubevirt-utils/components/AlertsCard/utils/types';
import { createAlertKey } from '@kubevirt-utils/components/AlertsCard/utils/utils';
import { KUBEVIRT } from '@kubevirt-utils/constants/constants';
import { getAlertsBasePath } from '@kubevirt-utils/constants/prometheus';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { PrometheusRulesResponse } from '@kubevirt-utils/types/prometheus';
import { generateAlertId, labelsToParams } from '@kubevirt-utils/utils/prometheus';
import {
  PrometheusEndpoint,
  RuleStates,
  useActivePerspective,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';

type UseVMAlerts = (vm: V1VirtualMachine) => SimplifiedAlerts;

const useVMAlerts: UseVMAlerts = (vm: V1VirtualMachine) => {
  const [perspective] = useActivePerspective();
  const [query] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.RULES,
  });

  const vmAlerts = React.useMemo(() => {
    // eslint-disable-next-line perfectionist/sort-objects
    const data = { critical: [], warning: [], info: [] };
    const vmName = getName(vm);
    return (
      (query as PrometheusRulesResponse)?.data?.groups?.reduce((acc, ruleGroup) => {
        ruleGroup?.rules?.forEach((rule) => {
          if (
            rule?.state === RuleStates.Firing &&
            rule?.labels?.kubernetes_operator_part_of === KUBEVIRT
          ) {
            rule?.alerts?.forEach((alert) => {
              const alertPodName = alert?.labels?.pod;
              const metricName = alert?.labels?.name;
              // NOTE: in 4.11 the alerts are missing a vmName label,
              // in 4.12 we will replace the following check with alertLabelVMName === vmName
              if (
                alertPodName?.includes(vmName) ||
                (metricName && vmName && metricName === vmName)
              ) {
                acc[alert?.labels?.severity] = [
                  ...(acc?.[alert?.labels?.severity] || []),
                  {
                    alertName: alert?.labels?.alertname,
                    description: alert?.annotations?.summary,
                    isVMAlert: true,
                    key: createAlertKey(alert?.activeAt, alert?.labels),
                    link: `${getAlertsBasePath(perspective, getNamespace(vm))}/${generateAlertId(
                      ruleGroup,
                      rule,
                    )}?${labelsToParams(alert?.labels)}`,
                    time: alert?.activeAt,
                  },
                ];
              }
            });
          }
        });

        return acc;
      }, data) || data
    );
  }, [query, vm]);

  return vmAlerts;
};

export default useVMAlerts;
