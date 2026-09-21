import { type TFunction } from 'i18next';

import {
  K8sIoApiCoreV1TolerationEffectEnum,
  K8sIoApiCoreV1TolerationOperatorEnum,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { type TolerationLabel } from './constants';
import {
  getIncompleteTolerationsTooltip,
  getTaintKeyRequiredMessage,
  hasIncompleteTolerations,
  toK8sTolerations,
} from './helpers';

const label = (overrides: Partial<TolerationLabel> = {}): TolerationLabel => ({
  effect: K8sIoApiCoreV1TolerationEffectEnum.NoSchedule,
  id: 0,
  key: 'dedicated',
  value: 'gpu',
  ...overrides,
});

describe('toK8sTolerations', () => {
  it('should strip the UI id field from each toleration', () => {
    const [toleration] = toK8sTolerations([label({ id: 7 })]);

    expect(toleration).not.toHaveProperty('id');
    expect(toleration).toEqual({
      effect: K8sIoApiCoreV1TolerationEffectEnum.NoSchedule,
      key: 'dedicated',
      operator: K8sIoApiCoreV1TolerationOperatorEnum.Equal,
      value: 'gpu',
    });
  });

  it('should set Exists when the value is empty', () => {
    const [toleration] = toK8sTolerations([label({ value: '' })]);

    expect(toleration.operator).toBe(K8sIoApiCoreV1TolerationOperatorEnum.Exists);
    expect(toleration).not.toHaveProperty('id');
  });

  it('should return an empty array when there are no rows', () => {
    expect(toK8sTolerations()).toEqual([]);
    expect(toK8sTolerations([])).toEqual([]);
  });
});

describe('hasIncompleteTolerations', () => {
  it('should return false for complete keys, empty values, and an empty list', () => {
    expect(hasIncompleteTolerations([])).toBe(false);
    expect(hasIncompleteTolerations([label()])).toBe(false);
    expect(hasIncompleteTolerations([label({ value: '' })])).toBe(false);
  });

  it('should return true when a new row has an empty taint key', () => {
    expect(hasIncompleteTolerations([label({ key: '' })])).toBe(true);
    expect(hasIncompleteTolerations([label({ key: '   ' })])).toBe(true);
  });

  it('should allow blank-key Exists tolerations loaded from Kubernetes', () => {
    expect(
      hasIncompleteTolerations([
        label({
          key: '',
          operator: K8sIoApiCoreV1TolerationOperatorEnum.Exists,
          value: '',
        }),
      ]),
    ).toBe(false);
  });
});

describe('getTaintKeyRequiredMessage', () => {
  const t = ((key: string) => key) as TFunction;

  it('should return the taint key required message', () => {
    expect(getTaintKeyRequiredMessage(t)).toBe('Taint key is required');
  });
});

describe('getIncompleteTolerationsTooltip', () => {
  const t = ((key: string) => key) as TFunction;

  it('should return a tooltip when rows are incomplete', () => {
    expect(getIncompleteTolerationsTooltip(true, t)).toBe('Taint key is required');
  });

  it('should return undefined when rows are complete', () => {
    expect(getIncompleteTolerationsTooltip(false, t)).toBeUndefined();
  });
});
