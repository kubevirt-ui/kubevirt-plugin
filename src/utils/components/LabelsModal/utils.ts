import { type LabelEntry } from './constants';

// Old LabelsModal utilities (tag-input based)
export const labelsToArray = (labels: { [key: string]: string }): string[] => {
  return Object.entries(labels).map(([key, value]) => (value ? `${key}=${value}` : key));
};

export const labelsArrayToObject = (labels: string[]): { [key: string]: string } => {
  const result = {};
  for (const item of labels) {
    const [key, value = null] = item.split('=');
    result[key] = value;
  }
  return result;
};

export const isLabelValid = (label: string): boolean => {
  return /^[0-9A-Za-z/\-_.=]+$/.test(label) && !label.includes(' ');
};

// New LabelsModal utilities (row-based)
export const labelsToEntries = (labels: Record<string, string>): LabelEntry[] =>
  Object.entries(labels).map(([key, value], index) => ({ id: index, key, value }));

export const entriesToLabels = (entries: LabelEntry[]): Record<string, string> =>
  Object.fromEntries(entries.map(({ key, value }) => [key, value]));
