import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { TabBadge } from '@kubevirt-utils/components/HorizontalNavbar/utils/utils';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { LabelProps } from '@patternfly/react-core';

import { INVERTED_CONDITION_TYPES, SEVERITY_TO_CONDITION } from './constants';
import { DiagnosticFilters, DiagnosticSeverity } from './types';

export const isActiveFilter = (filters: DiagnosticFilters, searchText: string): boolean =>
  filters.categories.size > 0 || filters.conditions.size > 0 || searchText.trim().length > 0;

export const matchesFilters = (
  filters: DiagnosticFilters,
  category: string,
  severity: DiagnosticSeverity,
): boolean => {
  const { categories, conditions } = filters;
  const categoryMatch = categories.size === 0 || categories.has(category);
  const conditionLabel = SEVERITY_TO_CONDITION[severity];
  const conditionMatch = conditions.size === 0 || conditions.has(conditionLabel);
  return categoryMatch && conditionMatch;
};

export const filterBySearchText = (
  searchText: string,
  ...fields: (string | undefined)[]
): boolean => {
  const trimmed = searchText?.trim();
  if (!trimmed) return true;
  const lower = trimmed.toLowerCase();
  return fields.some((f) => f?.toLowerCase().includes(lower));
};

const DV_FAILED_PHASES = new Set(['Failed', 'Unknown']);

export const getConditionSeverity = (status: string, type?: string): DiagnosticSeverity => {
  if (INVERTED_CONDITION_TYPES.has(type)) {
    return status === 'False' ? 'healthy' : 'warning';
  }
  if (status === 'False') return 'critical';
  if (status === 'True') return 'healthy';
  return 'warning';
};

export const getDVSeverity = (phase: string): DiagnosticSeverity => {
  if (DV_FAILED_PHASES.has(phase)) return 'critical';
  if (phase === 'Succeeded') return 'healthy';
  return 'warning';
};

export const getSnapshotSeverity = (enabled: boolean): DiagnosticSeverity =>
  enabled ? 'healthy' : 'warning';

export const getDiagnosticBadge = (vm: V1VirtualMachine): TabBadge | undefined => {
  const conditions = vm?.status?.conditions ?? [];
  const volumeSnapshotStatuses = vm?.status?.volumeSnapshotStatuses ?? [];

  const conditionSeverities = conditions.map((c) => getConditionSeverity(c.status, c.type));
  const critical = conditionSeverities.filter((s) => s === 'critical').length;
  const conditionWarnings = conditionSeverities.filter((s) => s === 'warning').length;
  const snapshotWarnings = volumeSnapshotStatuses.filter((v) => !v.enabled).length;

  const totalIssues = critical + conditionWarnings + snapshotWarnings;
  if (totalIssues === 0) return undefined;

  return {
    color: critical > 0 ? 'red' : 'yellow',
    count: totalIssues,
  };
};

type StatusLabel = { color: LabelProps['color']; text: string };

export const getConditionLabel = (status: string, type: string, t: TFunction): StatusLabel => {
  const severity = getConditionSeverity(status, type);
  if (severity === 'critical') return { color: 'red', text: t('Failed') };
  if (severity === 'healthy') return { color: 'green', text: t('Healthy') };
  return { color: 'orange', text: t('Degraded') };
};

export const getEnabledLabel = (enabled: boolean, t: TFunction): StatusLabel =>
  enabled ? { color: 'green', text: t('True') } : { color: 'red', text: t('False') };

export const getPhaseLabel = (phase: string, t: TFunction): StatusLabel => {
  switch (phase) {
    case 'Succeeded':
      return { color: 'green', text: t('Succeeded') };
    case 'Failed':
      return { color: 'red', text: t('Failed') };
    case 'Unknown':
      return { color: 'red', text: t('Unknown') };
    case 'ImportInProgress':
      return { color: 'blue', text: t('ImportInProgress') };
    case 'CloneInProgress':
      return { color: 'blue', text: t('CloneInProgress') };
    default:
      return { color: 'grey', text: phase || t('Unknown') };
  }
};

export const createURLDiagnostic = (str: string, append: string): string => {
  const urlSplit = str.split('/');
  if (
    urlSplit[urlSplit.length - 1] === VirtualMachineDetailsTab.Logs ||
    urlSplit[urlSplit.length - 1] === VirtualMachineDetailsTab.Tables
  ) {
    urlSplit.pop();
    urlSplit.push(append);
    return urlSplit.join('/');
  }
  return str.concat('/' + append);
};
