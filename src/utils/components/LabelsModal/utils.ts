import { LabelEntry } from './constants';

// Old LabelsModal utilities (tag-input based)
export const labelsToArray = (labels: { [key: string]: string }): string[] => {
  return Object.entries(labels).map(([k, v]) => (v ? `${k}=${v}` : k));
};

export const labelsArrayToObject = (labels: string[]): { [key: string]: string } => {
  const result = {};
  labels.forEach((item) => {
    const [key, value = null] = item.split('=');
    result[key] = value;
  });
  return result;
};

export const isLabelValid = (label: string) => {
  return /^[0-9A-Za-z/\-_.]+\s*=?\s*[0-9A-Za-z/\-_.]+$/.test(label) && !/\s/g.test(label);
};

// New LabelsModal utilities (row-based)
export const labelsToEntries = (labels: Record<string, string>): LabelEntry[] =>
  Object.entries(labels).map(([key, value], index) => ({ id: index, key, value }));

export const entriesToLabels = (entries: LabelEntry[]): Record<string, string> =>
  Object.fromEntries(entries.map(({ key, value }) => [key, value]));
