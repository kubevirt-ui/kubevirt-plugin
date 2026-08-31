export type HumanizeResult = {
  string?: string;
  unit: string;
  value: number | string;
};

export declare const units: Record<string, unknown>;
export declare const validate: Record<string, unknown>;

export declare const getType: (name: string) => unknown;

export declare const humanizeBinaryBytesWithoutB: (
  value: number,
  initialUnit?: string,
  preferredUnit?: string,
) => HumanizeResult;

export declare const humanizeBinaryBytes: (
  value: number,
  initialUnit?: string,
  preferredUnit?: string,
) => HumanizeResult;

export declare const humanizeDecimalBytes: (
  value: number,
  initialUnit?: string,
  preferredUnit?: string,
) => HumanizeResult;

export declare const humanizeDecimalBytesPerSec: (
  value: number,
  initialUnit?: string,
  preferredUnit?: string,
) => HumanizeResult;

export declare const humanizePacketsPerSec: (
  value: number,
  initialUnit?: string,
  preferredUnit?: string,
) => HumanizeResult;

export declare const humanizeNumber: (
  value: number,
  initialUnit?: string,
  preferredUnit?: string,
) => HumanizeResult;

export declare const humanizeNumberSI: (
  value: number,
  initialUnit?: string,
  preferredUnit?: string,
) => HumanizeResult;

export declare const humanizeSeconds: (
  value: number,
  initialUnit?: string,
  preferredUnit?: string,
) => HumanizeResult;

export declare const humanizeCpuCores: (value: number) => HumanizeResult;

export declare const humanizePercentage: (value: number) => HumanizeResult;

export declare const convertToBaseValue: (value: string) => null | number;

export declare const secondsToNanoSeconds: (value: number) => number;

export declare const formatToFractionalDigits: (value: number, digits: number) => string;

export declare const formatBytesAsMiB: (bytes: number) => string;

export declare const formatBytesAsGiB: (bytes: number) => string;

export declare const formatCores: (cores: number) => string;
