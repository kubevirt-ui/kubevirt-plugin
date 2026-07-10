import { pickRandomElement } from '../utils/random-data-generator';

import { BaseDataFactory } from './base-data-factory';

export enum OperatingSystem {
  CENTOS_STREAM_10 = 'CentOS Stream 10',
  CENTOS_STREAM_9 = 'CentOS Stream 9',
  FEDORA_AMD64 = 'Fedora (amd64)',
  RHEL_10_AMD64 = 'Red Hat Enterprise Linux 10 (amd64)',
  RHEL_8 = 'Red Hat Enterprise Linux 8',
  RHEL_9_AMD64 = 'Red Hat Enterprise Linux 9 (amd64)',
}

export enum InstanceTypeSeries {
  CX = 'CX series',
  M = 'M series',
  N = 'N series',
  O = 'O series',
  RT = 'RT series',
  U = 'U series',
}

export enum InstanceTypeSize {
  LARGE = 'large',
  MEDIUM = 'medium',
  MICRO = 'micro',
  NANO = 'nano',
  SMALL = 'small',
  XLARGE = 'xlarge',
  XLARGE_2 = '2xlarge',
  XLARGE_4 = '4xlarge',
  XLARGE_8 = '8xlarge',
}

export interface InstanceTypeConfig {
  cpus: number;
  memoryGiB?: number;
  memoryMiB?: number;
  series: InstanceTypeSeries;
  size: InstanceTypeSize;
}

export class CreateVmInstanceTypeFactory extends BaseDataFactory {
  private static readonly instanceTypeConfigs: Map<string, InstanceTypeConfig> = new Map([
    [
      'CX-2xlarge',
      { cpus: 8, memoryGiB: 16, series: InstanceTypeSeries.CX, size: InstanceTypeSize.XLARGE_2 },
    ],
    [
      'CX-4xlarge',
      { cpus: 16, memoryGiB: 32, series: InstanceTypeSeries.CX, size: InstanceTypeSize.XLARGE_4 },
    ],
    [
      'CX-8xlarge',
      { cpus: 32, memoryGiB: 64, series: InstanceTypeSeries.CX, size: InstanceTypeSize.XLARGE_8 },
    ],
    [
      'CX-large',
      { cpus: 2, memoryGiB: 4, series: InstanceTypeSeries.CX, size: InstanceTypeSize.LARGE },
    ],
    // CX series
    [
      'CX-medium',
      { cpus: 1, memoryGiB: 2, series: InstanceTypeSeries.CX, size: InstanceTypeSize.MEDIUM },
    ],
    [
      'CX-xlarge',
      { cpus: 4, memoryGiB: 8, series: InstanceTypeSeries.CX, size: InstanceTypeSize.XLARGE },
    ],

    [
      'M-2xlarge',
      { cpus: 8, memoryGiB: 64, series: InstanceTypeSeries.M, size: InstanceTypeSize.XLARGE_2 },
    ],
    [
      'M-4xlarge',
      { cpus: 16, memoryGiB: 128, series: InstanceTypeSeries.M, size: InstanceTypeSize.XLARGE_4 },
    ],
    [
      'M-8xlarge',
      { cpus: 32, memoryGiB: 256, series: InstanceTypeSeries.M, size: InstanceTypeSize.XLARGE_8 },
    ],
    // M series
    [
      'M-large',
      { cpus: 2, memoryGiB: 16, series: InstanceTypeSeries.M, size: InstanceTypeSize.LARGE },
    ],
    [
      'M-xlarge',
      { cpus: 4, memoryGiB: 32, series: InstanceTypeSeries.M, size: InstanceTypeSize.XLARGE },
    ],
    [
      'N-2xlarge',
      { cpus: 16, memoryGiB: 32, series: InstanceTypeSeries.N, size: InstanceTypeSize.XLARGE_2 },
    ],
    [
      'N-4xlarge',
      { cpus: 32, memoryGiB: 64, series: InstanceTypeSeries.N, size: InstanceTypeSize.XLARGE_4 },
    ],
    [
      'N-8xlarge',
      { cpus: 64, memoryGiB: 128, series: InstanceTypeSeries.N, size: InstanceTypeSize.XLARGE_8 },
    ],
    [
      'N-large',
      { cpus: 4, memoryGiB: 8, series: InstanceTypeSeries.N, size: InstanceTypeSize.LARGE },
    ],

    // N series
    [
      'N-medium',
      { cpus: 4, memoryGiB: 4, series: InstanceTypeSeries.N, size: InstanceTypeSize.MEDIUM },
    ],
    [
      'N-xlarge',
      { cpus: 8, memoryGiB: 16, series: InstanceTypeSeries.N, size: InstanceTypeSize.XLARGE },
    ],
    [
      'O-2xlarge',
      { cpus: 8, memoryGiB: 32, series: InstanceTypeSeries.O, size: InstanceTypeSize.XLARGE_2 },
    ],
    [
      'O-4xlarge',
      { cpus: 16, memoryGiB: 64, series: InstanceTypeSeries.O, size: InstanceTypeSize.XLARGE_4 },
    ],
    [
      'O-8xlarge',
      { cpus: 32, memoryGiB: 128, series: InstanceTypeSeries.O, size: InstanceTypeSize.XLARGE_8 },
    ],

    [
      'O-large',
      { cpus: 2, memoryGiB: 8, series: InstanceTypeSeries.O, size: InstanceTypeSize.LARGE },
    ],
    [
      'O-medium',
      { cpus: 1, memoryGiB: 4, series: InstanceTypeSeries.O, size: InstanceTypeSize.MEDIUM },
    ],
    [
      'O-micro',
      { cpus: 1, memoryGiB: 1, series: InstanceTypeSeries.O, size: InstanceTypeSize.MICRO },
    ],
    // O series
    [
      'O-nano',
      { cpus: 1, memoryMiB: 512, series: InstanceTypeSeries.O, size: InstanceTypeSize.NANO },
    ],
    [
      'O-small',
      { cpus: 1, memoryGiB: 2, series: InstanceTypeSeries.O, size: InstanceTypeSize.SMALL },
    ],
    [
      'O-xlarge',
      { cpus: 4, memoryGiB: 16, series: InstanceTypeSeries.O, size: InstanceTypeSize.XLARGE },
    ],
    [
      'RT-2xlarge',
      { cpus: 8, memoryGiB: 32, series: InstanceTypeSeries.RT, size: InstanceTypeSize.XLARGE_2 },
    ],
    [
      'RT-4xlarge',
      { cpus: 16, memoryGiB: 64, series: InstanceTypeSeries.RT, size: InstanceTypeSize.XLARGE_4 },
    ],

    [
      'RT-8xlarge',
      { cpus: 32, memoryGiB: 128, series: InstanceTypeSeries.RT, size: InstanceTypeSize.XLARGE_8 },
    ],
    [
      'RT-large',
      { cpus: 2, memoryGiB: 8, series: InstanceTypeSeries.RT, size: InstanceTypeSize.LARGE },
    ],
    [
      'RT-medium',
      { cpus: 1, memoryGiB: 4, series: InstanceTypeSeries.RT, size: InstanceTypeSize.MEDIUM },
    ],
    // RT series
    [
      'RT-micro',
      { cpus: 1, memoryGiB: 1, series: InstanceTypeSeries.RT, size: InstanceTypeSize.MICRO },
    ],
    [
      'RT-small',
      { cpus: 1, memoryGiB: 2, series: InstanceTypeSeries.RT, size: InstanceTypeSize.SMALL },
    ],
    [
      'RT-xlarge',
      { cpus: 4, memoryGiB: 16, series: InstanceTypeSeries.RT, size: InstanceTypeSize.XLARGE },
    ],

    [
      'U-2xlarge',
      { cpus: 8, memoryGiB: 32, series: InstanceTypeSeries.U, size: InstanceTypeSize.XLARGE_2 },
    ],
    [
      'U-4xlarge',
      { cpus: 16, memoryGiB: 64, series: InstanceTypeSeries.U, size: InstanceTypeSize.XLARGE_4 },
    ],
    [
      'U-8xlarge',
      { cpus: 32, memoryGiB: 128, series: InstanceTypeSeries.U, size: InstanceTypeSize.XLARGE_8 },
    ],
    [
      'U-large',
      { cpus: 2, memoryGiB: 8, series: InstanceTypeSeries.U, size: InstanceTypeSize.LARGE },
    ],
    [
      'U-medium',
      { cpus: 2, memoryGiB: 4, series: InstanceTypeSeries.U, size: InstanceTypeSize.MEDIUM },
    ],
    [
      'U-micro',
      { cpus: 1, memoryGiB: 1, series: InstanceTypeSeries.U, size: InstanceTypeSize.MICRO },
    ],
    // U series (General Purpose)
    [
      'U-nano',
      { cpus: 1, memoryMiB: 512, series: InstanceTypeSeries.U, size: InstanceTypeSize.NANO },
    ],
    [
      'U-small',
      { cpus: 1, memoryGiB: 2, series: InstanceTypeSeries.U, size: InstanceTypeSize.SMALL },
    ],
    [
      'U-xlarge',
      { cpus: 4, memoryGiB: 16, series: InstanceTypeSeries.U, size: InstanceTypeSize.XLARGE },
    ],
  ]);

  /**
   * Gets all available operating systems
   * @returns Array of all operating systems
   */
  static getAllOperatingSystems(): OperatingSystem[] {
    return Object.values(OperatingSystem);
  }

  /**
   * Gets all available series
   * @returns Array of all instance type series
   */
  static getAllSeries(): InstanceTypeSeries[] {
    return Object.values(InstanceTypeSeries);
  }

  /**
   * Gets all available sizes for a specific series
   * @param series - The instance type series
   * @returns Array of available sizes for the series
   */
  static getAvailableSizesForSeries(series: InstanceTypeSeries): InstanceTypeSize[] {
    const sizes: InstanceTypeSize[] = [];

    for (const config of this.instanceTypeConfigs.values()) {
      if (config.series === series) {
        sizes.push(config.size);
      }
    }

    return sizes;
  }

  /**
   * Gets the configuration for a specific instance type
   * @param series - The instance type series (N, O, M, RT, CX, U)
   * @param size - The size of the instance type
   * @returns The instance type configuration
   */
  static getConfig(series: InstanceTypeSeries, size: InstanceTypeSize): InstanceTypeConfig {
    const key = this.getKey(series, size);
    const config = this.instanceTypeConfigs.get(key);

    if (!config) {
      throw new Error(`Instance type configuration not found for ${series} - ${size}`);
    }

    return config;
  }

  /**
   * Generates the button text string for selecting an instance size in the UI
   * @param series - The instance type series
   * @param size - The size of the instance type
   * @returns The formatted string as it appears in the UI (e.g., "medium: 4 CPUs, 4 GiB Memory")
   */
  static getInstanceSizeButtonText(series: InstanceTypeSeries, size: InstanceTypeSize): string {
    const config = this.getConfig(series, size);
    const memoryText = config.memoryGiB
      ? `${config.memoryGiB} GiB Memory`
      : `${config.memoryMiB} MiB Memory`;

    return `${size}: ${config.cpus} CPUs, ${memoryText}`;
  }

  /**
   * Generates a unique key for looking up configurations
   */
  private static getKey(series: InstanceTypeSeries, size: InstanceTypeSize): string {
    const seriesPrefix = series.split(' ')[0]; // Extract "N" from "N series"
    return `${seriesPrefix}-${size}`;
  }

  /**
   * Generates a random operating system
   * @returns A random operating system from the available options
   */
  static getRandomOperatingSystem(): OperatingSystem {
    const allOS = this.getAllOperatingSystems();
    return pickRandomElement(allOS);
  }

  /**
   * Generates a random instance type series
   * @returns A random series from the available options
   */
  static getRandomSeries(): InstanceTypeSeries {
    const allSeries = this.getAllSeries();
    return pickRandomElement(allSeries);
  }

  /**
   * Generates a random instance size for a given series
   * @param series - The instance type series
   * @returns A random size available for the given series
   */
  static getRandomSizeForSeries(series: InstanceTypeSeries): InstanceTypeSize {
    const availableSizes = this.getAvailableSizesForSeries(series);
    return pickRandomElement(availableSizes);
  }
}
