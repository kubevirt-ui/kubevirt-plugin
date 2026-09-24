export const SERIAL_REGEX = /^[a-zA-Z0-9._+\-]*$/;
export const SERIAL_MAX_LENGTH_DEFAULT = 20;
export const SERIAL_MAX_LENGTH_SCSI = 36;
export const SERIAL_HELPER_ID = 'disk-serial-helper';

export const getSerialMaxLength = (bus: string | undefined): number =>
  bus === 'scsi' ? SERIAL_MAX_LENGTH_SCSI : SERIAL_MAX_LENGTH_DEFAULT;

const SERIAL_SEGMENT_LENGTH = 4;
const SERIAL_SEGMENT_COUNT = 3;

export const generateRandomSerial = (): string => {
  const segments = Array.from({ length: SERIAL_SEGMENT_COUNT }, () => {
    let segment = '';
    for (let i = 0; i < SERIAL_SEGMENT_LENGTH; i++) {
      // eslint-disable-next-line -- sonarjs/pseudo-random
      segment += String.fromCharCode(97 + Math.floor(Math.random() * 26));
    }
    return segment;
  });
  return segments.join('-');
};

export const isSerialValid = (value: string): boolean => SERIAL_REGEX.test(value);

export const validateSerial = (
  value: string | undefined,
  existingSerials: string[],
  maxLength: number,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string | true => {
  if (!value) return true;

  if (!isSerialValid(value)) {
    return t('Serial number can only contain letters, numbers, and the characters . _ + -');
  }

  if (value.length > maxLength) {
    return t('Serial number must be {{max}} characters or fewer', { max: maxLength });
  }

  if (existingSerials.includes(value.toLowerCase())) {
    return t('Serial number must be unique across disks on the same VirtualMachine');
  }

  return true;
};
