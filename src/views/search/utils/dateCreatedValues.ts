import { TFunction } from 'i18next';

import { yyyyMMddFormat } from '@patternfly/react-core';
import {
  DateSelectOption,
  dateSelectOptions,
  getDateSelectLabels,
} from '@search/components/AdvancedSearchModal/constants/dateSelect';

export const LAST_N_DAYS_REGEX = /^last-(\d+)-days$/;
export const FROM_PREFIX = 'from-';
export const TO_PREFIX = 'to-';

export const isDateCreatedQuickValue = (value: string): boolean => {
  const lower = value.toLowerCase();
  return dateSelectOptions.includes(lower as DateSelectOption) || LAST_N_DAYS_REGEX.test(lower);
};

export const isFromValue = (value: string): boolean => value.startsWith(FROM_PREFIX);
export const isToValue = (value: string): boolean => value.startsWith(TO_PREFIX);

export const stripFromPrefix = (value: string): string => value.slice(FROM_PREFIX.length);
export const stripToPrefix = (value: string): string => value.slice(TO_PREFIX.length);

const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const isValidDateString = (value: string): boolean => {
  if (!DATE_FORMAT_REGEX.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const getDaysBackDate = (daysBack: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  return yyyyMMddFormat(date);
};

export const resolveDateCreatedValue = (value: string): { from: string; to?: string } | null => {
  const lower = value.toLowerCase();

  if (lower === DateSelectOption.Today) {
    return { from: getDaysBackDate(0) };
  }

  if (lower === DateSelectOption.Yesterday) {
    return { from: getDaysBackDate(1), to: getDaysBackDate(0) };
  }

  const match = lower.match(LAST_N_DAYS_REGEX);
  if (match) {
    const n = parseInt(match[1], 10);
    if (n > 0) return { from: getDaysBackDate(n) };
  }

  return null;
};

export const getDateCreatedChipLabel = (value: string, t: TFunction): string => {
  const labels = getDateSelectLabels(t);
  const label = labels[value as DateSelectOption];
  if (label && value !== DateSelectOption.Custom) return label;

  const match = value.match(LAST_N_DAYS_REGEX);
  if (match) {
    const count = parseInt(match[1], 10);
    return t('Last {{count}} days', { count });
  }

  return value;
};
