import { mergeOptions } from '../overrides';

const action = (id: number) => ({ cta: { href: '' }, id: String(id) });

describe('mergeOptions', () => {
  test('empty list', () => {
    expect(mergeOptions([])).toEqual([]);
  });
  test('one action, one option', () => {
    expect(
      mergeOptions([action(5), { children: [action(12)], id: '1', label: 'first one' }]),
    ).toEqual([action(5), { children: [action(12)], id: '1', label: 'first one' }]);
  });
  test('dropping duplicated actions (on the same level)', () => {
    expect(mergeOptions([action(5), action(5)])).toEqual([action(5)]);
  });
  test('stable grouping', () => {
    expect(
      mergeOptions([
        { children: [], id: '2', label: 'first two' },
        action(5),
        { children: [], id: '2', label: 'second two' },
      ]),
    ).toEqual([{ children: [], id: '2', label: 'first two' }, action(5)]);
  });
  test('1 level of options', () => {
    expect(
      mergeOptions([
        { children: [action(12)], id: '1', label: 'first one' },
        { children: [], id: '2', label: 'first two' },
        { children: [action(13)], id: '1', label: 'second one' },
      ]),
    ).toEqual([
      {
        children: [action(12), action(13)],
        id: '1',
        label: 'first one',
      },
      { children: [], id: '2', label: 'first two' },
    ]);
  });

  test('2 levels of options', () => {
    expect(
      mergeOptions([
        {
          children: [action(7), { children: [action(9)], id: '8', label: 'first eight' }],
          id: '6',
          label: 'first six',
        },
        action(5),
        {
          children: [{ children: [action(10)], id: '8', label: 'second eight' }, action(11)],
          id: '6',
          label: 'second six',
        },
      ]),
    ).toEqual([
      {
        children: [
          action(7),
          {
            children: [action(9), action(10)],
            id: '8',
            label: 'first eight',
          },
          action(11),
        ],
        id: '6',
        label: 'first six',
      },
      action(5),
    ]);
  });
});
