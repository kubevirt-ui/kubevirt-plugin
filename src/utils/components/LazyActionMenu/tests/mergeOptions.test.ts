import { mergeOptions } from '../overrides';

describe('mergeOptions', () => {
  test('empty list', () => {
    expect(mergeOptions([])).toEqual([]);
  });
  test('one action, one option', () => {
    expect(
      mergeOptions([
        { cta: { href: '' }, id: '5' },
        { children: [{ cta: { href: '' }, id: '12' }], id: '1', label: 'first one' },
      ]),
    ).toEqual([
      { cta: { href: '' }, id: '5' },
      { children: [{ cta: { href: '' }, id: '12' }], id: '1', label: 'first one' },
    ]);
  });
  test('dropping duplicated actions (on the same level', () => {
    expect(
      mergeOptions([
        { cta: { href: '' }, id: '5' },
        { cta: { href: '' }, id: '5' },
      ]),
    ).toEqual([{ cta: { href: '' }, id: '5' }]);
  });
  test('stable grouping', () => {
    expect(
      mergeOptions([
        { children: [], id: '2', label: 'first two' },
        { cta: { href: '' }, id: '5' },
        { children: [], id: '2', label: 'second two' },
      ]),
    ).toEqual([
      { children: [], id: '2', label: 'first two' },
      { cta: { href: '' }, id: '5' },
    ]);
  });
  test('1 level of options', () => {
    expect(
      mergeOptions([
        { children: [{ cta: { href: '' }, id: '12' }], id: '1', label: 'first one' },
        { children: [], id: '2', label: 'first two' },
        { children: [{ cta: { href: '' }, id: '13' }], id: '1', label: 'second one' },
      ]),
    ).toEqual([
      {
        children: [
          { cta: { href: '' }, id: '12' },
          { cta: { href: '' }, id: '13' },
        ],
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
          children: [
            { cta: { href: '' }, id: '7' },
            { children: [{ cta: { href: '' }, id: '9' }], id: '8', label: 'first eight' },
          ],
          id: '6',
          label: 'first six',
        },
        { cta: { href: '' }, id: '5' },
        {
          children: [
            { children: [{ cta: { href: '' }, id: '10' }], id: '8', label: 'second eight' },
            { cta: { href: '' }, id: '11' },
          ],
          id: '6',
          label: 'second six',
        },
      ]),
    ).toEqual([
      {
        children: [
          { cta: { href: '' }, id: '7' },
          {
            children: [
              { cta: { href: '' }, id: '9' },
              { cta: { href: '' }, id: '10' },
            ],
            id: '8',
            label: 'first eight',
          },
          { cta: { href: '' }, id: '11' },
        ],
        id: '6',
        label: 'first six',
      },
      { cta: { href: '' }, id: '5' },
    ]);
  });
});
