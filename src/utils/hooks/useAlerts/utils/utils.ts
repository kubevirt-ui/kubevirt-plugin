import { Group } from '@kubevirt-utils/types/prometheus';
import { generateAlertId } from '@kubevirt-utils/utils/prometheus';
import {
  Alert,
  AlertStates,
  PrometheusAlert,
  PrometheusRule,
  Rule,
  RuleStates,
  Silence,
  SilenceStates,
} from '@openshift-console/dynamic-plugin-sdk';

export const addAlertIdToRule = (group: Group, rule: PrometheusRule): Rule => {
  return { ...rule, id: generateAlertId(group, rule) };
};

export const isSilenced = (alert: Alert | PrometheusAlert, silence: Silence): boolean =>
  [AlertStates.Firing, AlertStates.Silenced].includes(alert.state) &&
  silence?.matchers?.every((matcher) => {
    const alertValue = alert?.labels?.[matcher.name] || '';
    const isMatch = matcher.isRegex
      ? new RegExp(`^${matcher.value}$`).test(alertValue)
      : alertValue === matcher.value;
    return matcher.isEqual === false && alertValue ? !isMatch : isMatch;
  });

const getSilencesForAlert = (alert: Alert, activeSilences: Silence[]): Silence[] =>
  activeSilences?.filter((silence) => isSilenced(alert, silence));

const getSilencesForRule = (alert: Alert, activeSilences: Silence[]): Silence[] =>
  activeSilences?.filter((silence) =>
    alert?.rule?.alerts?.some((ruleAlert) => isSilenced(ruleAlert, silence)),
  );

const setRuleAlertsState = (alert: Alert): void =>
  alert?.rule?.alerts?.forEach((ruleAlert) => {
    if (alert?.silencedBy?.some((silence) => isSilenced(ruleAlert, silence))) {
      ruleAlert.state = AlertStates.Silenced;
    }
  });

const alertIsSilenced = (alert: Alert): boolean => alert?.silencedBy?.length > 0;

const allRuleAlertsAreSilenced = (alert: Alert): boolean =>
  alert?.rule?.alerts?.every((rulesAlert) => rulesAlert.state === AlertStates.Silenced);

/**
 *  For each firing alert, store a list of the Silences that
 *  are silencing it and set its state to show it is silenced
 * @param alerts All alerts in the cluster
 * @param silences All silences in the cluster
 */
export const silenceFiringAlerts = (alerts: Alert[], silences: Silence[]): Alert[] => {
  const activeSilences = silences?.filter(
    (silence) => silence?.status?.state === SilenceStates.Active,
  );

  return alerts?.map((alert) => {
    // Skip alerts non-firing alerts
    if (alert?.state !== AlertStates.Firing) {
      return alert;
    }

    alert.silencedBy = getSilencesForAlert(alert, activeSilences);
    if (alertIsSilenced(alert)) {
      alert.state = AlertStates.Silenced;
      setRuleAlertsState(alert);
      if (allRuleAlertsAreSilenced(alert)) {
        alert.rule.state = RuleStates.Silenced;
        alert.rule.silencedBy = getSilencesForRule(alert, activeSilences);
      }
    }
    return alert;
  });
};
