import { type TFunction } from 'i18next';

import { ApplicationAwareResourceQuotaModel } from '@kubevirt-utils/models';
import { type ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import { RESOURCE_KEYS } from './constants';
import { getAdditionalQuotaDisplayValue } from './utils';

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

const createQuota = (
  hard: Record<string, string>,
  used: Record<string, string>,
): ApplicationAwareQuota =>
  ({
    kind: ApplicationAwareResourceQuotaModel.kind,
    status: { hard, used },
  }) as ApplicationAwareQuota;

describe('getAdditionalQuotaDisplayValue', () => {
  it('returns a dash when there are no additional keys', () => {
    expect(
      getAdditionalQuotaDisplayValue(
        createQuota({ [RESOURCE_KEYS.cpuRequests]: '4' }, { [RESOURCE_KEYS.cpuRequests]: '1' }),
        t,
      ),
    ).toBe(NO_DATA_DASH);
  });

  it('serializes additional keys as label: used / hard', () => {
    expect(
      getAdditionalQuotaDisplayValue(
        createQuota(
          {
            [RESOURCE_KEYS.cpuRequests]: '4',
            [RESOURCE_KEYS.pods]: '10',
            [RESOURCE_KEYS.secrets]: '20',
          },
          {
            [RESOURCE_KEYS.cpuRequests]: '1',
            [RESOURCE_KEYS.pods]: '2',
            [RESOURCE_KEYS.secrets]: '3',
          },
        ),
        t,
      ),
    ).toBe('Pods: 2 / 10, Secrets: 3 / 20');
  });

  it('dashes a missing used value', () => {
    expect(getAdditionalQuotaDisplayValue(createQuota({ [RESOURCE_KEYS.pods]: '10' }, {}), t)).toBe(
      `Pods: ${NO_DATA_DASH} / 10`,
    );
  });
});
