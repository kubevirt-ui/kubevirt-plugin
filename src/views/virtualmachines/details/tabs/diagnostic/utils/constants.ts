import { DiagnosticFilters, DiagnosticSeverity } from './types';

export const INVERTED_CONDITION_TYPES = new Set(['RestartRequired']);

export const createEmptyFilters = (): DiagnosticFilters => ({
  categories: new Set(),
  conditions: new Set(),
});

export const DiagnosticCategory = {
  Storage: 'Storage',
  VirtualMachines: 'VirtualMachines',
} as const;

export type DiagnosticCategory = (typeof DiagnosticCategory)[keyof typeof DiagnosticCategory];

export const DiagnosticCondition = {
  Degraded: 'Degraded',
  Failed: 'Failed',
  Healthy: 'Healthy',
} as const;

export type DiagnosticCondition = (typeof DiagnosticCondition)[keyof typeof DiagnosticCondition];

export const DIAGNOSTIC_CATEGORIES = Object.values(DiagnosticCategory);
export const DIAGNOSTIC_CONDITIONS = Object.values(DiagnosticCondition);

export const SEVERITY_TO_CONDITION: Record<DiagnosticSeverity, DiagnosticCondition> = {
  critical: DiagnosticCondition.Failed,
  healthy: DiagnosticCondition.Healthy,
  warning: DiagnosticCondition.Degraded,
};

export const CONDITION_TO_SEVERITY: Record<DiagnosticCondition, DiagnosticSeverity> = {
  [DiagnosticCondition.Degraded]: 'warning',
  [DiagnosticCondition.Failed]: 'critical',
  [DiagnosticCondition.Healthy]: 'healthy',
};
