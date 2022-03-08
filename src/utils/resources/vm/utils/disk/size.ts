export const hasNumber = (rawSize: string): number => {
  const number = rawSize?.match(/\d+/g);
  return Number(number);
};

export const hasSizeUnit = (rawSize: string): string => {
  const unit = rawSize?.match(/[a-zA-Z]+/g);
  return unit?.[0];
};

export const formatBytes = (rawSize: string, unit?: string): string => {
  if (!rawSize) {
    return '-';
  }
  const size = hasNumber(rawSize);
  const sizeUnit = hasSizeUnit(rawSize) || unit;
  const sizeUnits = ['B', 'Ki', 'Mi', 'Gi', 'Ti'];
  let unitIndex = (sizeUnit && sizeUnits.findIndex((sUnit) => sUnit === sizeUnit)) || 0;
  let convertedSize = size;
  while (convertedSize >= 1024) {
    convertedSize = convertedSize / 1024;
    ++unitIndex;
  }

  const formattedSize = convertedSize.toFixed(2).concat(' ', sizeUnits[unitIndex]);
  return formattedSize;
};
