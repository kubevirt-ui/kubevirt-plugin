export const extractKeyValueFromLabel = (label: string): string[] => label?.split('=');

export const transformKeyValueToLabel = (key: string, value: string): string =>
  value ? `${key}=${value}` : key;
