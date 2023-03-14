import { murmur3 } from 'murmurhash-js';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Alert,
  AlertStates,
  PrometheusRule,
  Rule,
  RuleStates,
  Silence,
  SilenceStates,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  Group,
  MONITORING_SALT,
  PrometheusRulesResponse,
} from '@virtualmachines/details/tabs/overview/utils/utils';

export const addAlertIdToRule = (group: Group, rule: PrometheusRule): Rule => {
  const key = [
    group?.file,
    group?.name,
    rule?.name,
    rule?.duration,
    rule?.query,
    ...Object?.entries(rule?.labels).map(([k, v]) => `${v}=${k}`),
  ].join(',');
  return { ...rule, id: String(murmur3(key, MONITORING_SALT)) };
};

export const getAlertsAndRules = (
  data: PrometheusRulesResponse['data'],
): { alerts: Alert[]; rules: Rule[] } => {
  // Flatten the rules data to make it easier to work with, discard non-alerting rules since those
  // are the only ones we will be using and add a unique ID to each rule.
  const groups = data?.groups as PrometheusRulesResponse['data']['groups'];
  const rules = groups?.flatMap((group) =>
    group?.rules
      ?.filter((rule) => rule?.type === 'alerting')
      ?.map((rule) => addAlertIdToRule(group, rule)),
  );

  // Add rule object to each alert
  const alerts = rules?.flatMap((rule) => rule?.alerts?.map((alert) => ({ rule, ...alert })));

  return { alerts, rules };
};

export const isSilenced = (alert: Alert, silence: Silence): boolean =>
  [AlertStates.Firing, AlertStates.Silenced].includes(alert.state) &&
  silence?.matchers?.every((m) => {
    const alertValue = alert?.labels?.[m.name] || '';
    const isMatch = m.isRegex
      ? new RegExp(`^${m.value}$`).test(alertValue)
      : alertValue === m.value;
    return m.isEqual === false && alertValue ? !isMatch : isMatch;
  });

export const silenceFiringAlerts = (alerts, silences): Alert[] =>
  // For each firing alert, store a list of the Silences that are silencing it
  // and set its state to show it is silenced
  alerts?.map((alert) => {
    if (alert?.state !== AlertStates.Firing) {
      return alert;
    }

    alert.silencedBy = silences?.filter(
      (silence) => silence?.status?.state === SilenceStates.Active && isSilenced(alert, silence),
    );
    if (alert?.silencedBy?.length) {
      alert.state = AlertStates.Silenced;
      // Also set the state of Alerts in `rule.alerts`
      alert?.rule?.alerts?.forEach((ruleAlert) => {
        if (alert?.silencedBy?.some((s) => isSilenced(ruleAlert, s))) {
          ruleAlert.state = AlertStates.Silenced;
        }
      });
      if (!isEmpty(alert?.rule?.alerts) && alert?.rule?.alerts?.every(isSilenced)) {
        alert.rule.state = RuleStates.Silenced;
        alert.rule.silencedBy = silences?.data?.filter(
          (silence) =>
            silence.status.state === SilenceStates.Active && alert?.rule?.alerts?.some(isSilenced),
        );
      }
    }
    return alert;
  });
