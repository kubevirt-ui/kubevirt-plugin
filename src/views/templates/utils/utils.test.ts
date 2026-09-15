import { type TFunction } from 'i18next';

import {
  TemplateModel,
  type V1Template,
  VirtualMachineModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import { getVirtualMachineTemplatesCPUMemoryValue } from './utils';

const t = ((key: string, options?: Record<string, unknown>) => {
  if (!options) {
    return key;
  }

  return Object.entries(options).reduce((result, [name, value]) => {
    if (typeof value !== 'string' && typeof value !== 'number') {
      return result;
    }
    return result.replaceAll(`{{${name}}}`, String(value));
  }, key);
}) as TFunction;

const createTemplate = (cpuCores?: number, memory?: string): V1Template =>
  ({
    kind: TemplateModel.kind,
    objects: [
      {
        kind: VirtualMachineModel.kind,
        spec: {
          template: {
            spec: {
              domain: {
                ...(cpuCores ? { cpu: { cores: cpuCores } } : {}),
                ...(memory ? { memory: { guest: memory } } : {}),
              },
            },
          },
        },
      },
    ],
  }) as V1Template;

describe('getVirtualMachineTemplatesCPUMemoryValue', () => {
  it('returns formatted CPU and memory text', () => {
    expect(getVirtualMachineTemplatesCPUMemoryValue(createTemplate(2, '4Gi'), t)).toBe(
      '2 CPU | 4 GiB Memory',
    );
  });

  it('returns None when CPU and memory are missing', () => {
    expect(getVirtualMachineTemplatesCPUMemoryValue(createTemplate(), t)).toBe('None');
  });

  it('dashes the missing side when only CPU or only memory is set', () => {
    expect(getVirtualMachineTemplatesCPUMemoryValue(createTemplate(2), t)).toBe(
      `2 CPU | ${NO_DATA_DASH} Memory`,
    );
    expect(getVirtualMachineTemplatesCPUMemoryValue(createTemplate(undefined, '4Gi'), t)).toBe(
      `${NO_DATA_DASH} CPU | 4 GiB Memory`,
    );
  });
});
