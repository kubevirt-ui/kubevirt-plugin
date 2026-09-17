import { type TFunction } from 'i18next';

import { type V1CPU } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { vCPUCount } from '@kubevirt-utils/resources/template/utils';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';

import { NO_DATA_DASH } from './constants';

export type CPUMemoryDisplayValue = {
  /** cpu | memory text, or NO_DATA_DASH when both cpu and memory are not defined */
  cpuMemoryText: string;
  /** true when both cpu and memory are undefined */
  isEmpty: boolean;
};

export type CPUMemoryDisplayOptions = {
  customFormat?: (cpu: string, memory: string) => string;
};

/**
 * Generates a display value for CPU and memory information.
 *
 * @param cpu - The CPU configuration object from Kubevirt API
 * @param memory - The memory value as a string (e.g., "2Gi", "1024Mi")
 * @param t - Translation function from i18next for internationalization
 * @param options - Optional configuration object for customizing the display format
 * @returns An object containing the formatted CPU/memory text and whether the data is empty
 */
export const getCPUMemoryDisplayValue = (
  cpu: V1CPU | undefined,
  memory: string | undefined,
  t: TFunction,
  options?: CPUMemoryDisplayOptions,
): CPUMemoryDisplayValue => {
  const isEmpty = !cpu && !memory;

  const cpuText = cpu ? `${vCPUCount(cpu)}` : NO_DATA_DASH;
  const memoryText = memory ? readableSizeUnit(memory) : NO_DATA_DASH;

  if (isEmpty) {
    return {
      cpuMemoryText: NO_DATA_DASH,
      isEmpty: true,
    };
  }

  const cpuMemoryText = options?.customFormat
    ? options.customFormat(cpuText, memoryText)
    : getCPUMemoryLabel(cpuText, memoryText, t);

  return {
    cpuMemoryText,
    isEmpty: false,
  };
};

const getCPUMemoryLabel = (cpu: string, memory: string, t: TFunction): string =>
  t('{{cpu}} CPU | {{memory}} Memory', { cpu, memory });
