import { type TFunction } from 'i18next';

import {
  getIncompleteSelectorLabelMessage,
  getIncompleteSelectorLabelsTooltip,
  hasIncompleteSelectorLabels,
  idLabelsToNodeSelector,
  isEqualObject,
  nodeSelectorToIDLabels,
} from './helpers';
import { type IDLabel } from './types';

const label = (overrides: Partial<IDLabel>): IDLabel => ({
  id: 0,
  key: 'kubernetes.io/hostname',
  value: 'node-1',
  ...overrides,
});

describe('nodeSelectorToIDLabels', () => {
  it('should convert a nodeSelector map into labeled rows with ids', () => {
    expect(nodeSelectorToIDLabels({ disktype: 'ssd', 'kubernetes.io/hostname': 'node-1' })).toEqual(
      [
        { id: 0, key: 'disktype', value: 'ssd' },
        { id: 1, key: 'kubernetes.io/hostname', value: 'node-1' },
      ],
    );
  });

  it('should return an empty array for an empty nodeSelector', () => {
    expect(nodeSelectorToIDLabels({})).toEqual([]);
  });
});

describe('idLabelsToNodeSelector', () => {
  it('should convert rows into a nodeSelector map', () => {
    expect(
      idLabelsToNodeSelector([label({ id: 0 }), label({ id: 1, key: 'disktype', value: 'ssd' })]),
    ).toEqual({ disktype: 'ssd', 'kubernetes.io/hostname': 'node-1' });
  });

  it('should omit rows with an empty or whitespace-only key', () => {
    expect(
      idLabelsToNodeSelector([
        label({ id: 0, key: '', value: 'ignored' }),
        label({ id: 1, key: '   ', value: 'ignored' }),
        label({ id: 2, key: 'disktype', value: 'ssd' }),
      ]),
    ).toEqual({ disktype: 'ssd' });
  });
});

describe('hasIncompleteSelectorLabels', () => {
  it('should return false for complete keys, empty values, and an empty list', () => {
    expect(hasIncompleteSelectorLabels([])).toBe(false);
    expect(hasIncompleteSelectorLabels([label({ id: 0 })])).toBe(false);
    expect(hasIncompleteSelectorLabels([label({ value: '' })])).toBe(false);
    expect(hasIncompleteSelectorLabels([label({ value: '  ' })])).toBe(false);
  });

  it('should return true when a key is empty', () => {
    expect(hasIncompleteSelectorLabels([label({ key: '' })])).toBe(true);
    expect(hasIncompleteSelectorLabels([label({ key: '   ' })])).toBe(true);
  });
});

describe('getIncompleteSelectorLabelMessage', () => {
  const t = ((key: string) => key) as TFunction;

  it('should return a message when the key is empty', () => {
    expect(getIncompleteSelectorLabelMessage('', t)).toBe('Key is required');
    expect(getIncompleteSelectorLabelMessage('   ', t)).toBe('Key is required');
  });

  it('should return undefined when the key is present', () => {
    expect(getIncompleteSelectorLabelMessage('disktype', t)).toBeUndefined();
  });
});

describe('getIncompleteSelectorLabelsTooltip', () => {
  const t = ((key: string) => key) as TFunction;

  it('should return a tooltip when rows are incomplete', () => {
    expect(getIncompleteSelectorLabelsTooltip(true, t)).toBe('Key must not be empty');
  });

  it('should return undefined when rows are complete', () => {
    expect(getIncompleteSelectorLabelsTooltip(false, t)).toBeUndefined();
  });
});

describe('isEqualObject', () => {
  it('should detect equal and unequal objects', () => {
    expect(isEqualObject({ a: '1' }, { a: '1' })).toBe(true);
    expect(isEqualObject({ a: '1' }, { a: '2' })).toBe(false);
    expect(isEqualObject(null, {})).toBe(false);
  });
});
