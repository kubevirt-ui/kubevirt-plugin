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

