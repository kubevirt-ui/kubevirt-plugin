export const TYPES = {
  binaryBytes: {
    divisor: 1024,
    space: true,
    units: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'],
  },
  binaryBytesWithoutB: {
    divisor: 1024,
    space: true,
    units: ['B', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei'],
  },
  decimalBytes: {
    divisor: 1000,
    space: true,
    units: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'],
  },
  decimalBytesPerSec: {
    divisor: 1000,
    space: true,
    units: ['Bps', 'KBps', 'MBps', 'GBps', 'TBps', 'PBps', 'EBps'],
  },
  decimalBytesWithoutB: {
    divisor: 1000,
    space: true,
    units: ['B', 'k', 'M', 'G', 'T', 'P', 'E'],
  },
  numeric: {
    divisor: 1000,
    space: false,
    units: ['', 'k', 'm', 'b'],
  },
  packetsPerSec: {
    divisor: 1000,
    space: true,
    units: ['pps', 'kpps'],
  },
  seconds: {
    divisor: 1000,
    space: true,
    units: ['ns', 'μs', 'ms', 's'],
  },
  SI: {
    divisor: 1000,
    space: false,
    units: ['', 'k', 'M', 'G', 'T', 'P', 'E'],
  },
};
