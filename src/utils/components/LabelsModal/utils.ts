import { type LabelEntry } from './constants';

type ProcessLabelChangeResult =
  | { isValid: false; labels?: never }
  | { isValid: true; labels: string[] };

const getLabelKey = (label: string): string => label.split('=')[0];

export const processLabelChange = (
  newLabels: string[],
  changed: string[],
): ProcessLabelChangeResult => {
  const newLabel = changed[0];
  if (!isLabelValid(newLabel)) {
    return { isValid: false };
  }

  // duplicate labels
  if (newLabels.filter((label) => label === newLabel).length > 1) {
    return { isValid: false };
  }

  // if key exists, overwrite value
  if (newLabels.filter((label) => getLabelKey(label) === getLabelKey(newLabel)).length > 1) {
    const filteredLabels = newLabels.filter(
      (label) => getLabelKey(label) !== getLabelKey(newLabel),
    );
    return { isValid: true, labels: [...filteredLabels, newLabel] };
  }

  return { isValid: true, labels: newLabels };
};

// Old LabelsModal utilities (tag-input based)
export const labelsToArray = (labels: { [key: string]: string }): string[] => {
  return Object.entries(labels).map(([key, value]) => (value ? `${key}=${value}` : key));
};

export const labelsArrayToObject = (labels: string[]): { [key: string]: string } => {
  const result: { [key: string]: string } = {};
  for (const item of labels) {
    const separatorIndex = item.indexOf('=');
    const key = separatorIndex === -1 ? item : item.slice(0, separatorIndex);
    const value = separatorIndex === -1 ? '' : item.slice(separatorIndex + 1);
    if (key) result[key] = value;
  }
  return result;
};

export const isLabelValid = (label: string): boolean => {
  if (!label || label.includes(' ')) return false;
  const separatorIndex = label.indexOf('=');
  const key = separatorIndex === -1 ? label : label.slice(0, separatorIndex);
  return key.length > 0 && /^[0-9A-Za-z/\-_.=]+$/.test(label);
};

// New LabelsModal utilities (row-based)
export const labelsToEntries = (labels: Record<string, string>): LabelEntry[] =>
  Object.entries(labels).map(([key, value], index) => ({ id: index, key, value }));

export const entriesToLabels = (entries: LabelEntry[]): Record<string, string> =>
  Object.fromEntries(entries.map(({ key, value }) => [key, value]));
