import { flattenToAccessReview } from '../overrides';

describe('flattenToAccessReview', () => {
  test('empty list', () => {
    expect(flattenToAccessReview([])).toEqual([]);
  });
  test('2 levels of options', () => {
    expect(
      flattenToAccessReview([
        {
          children: [
            { accessReview: { name: '5' }, cta: { href: '' }, id: '7' },
            {
              children: [
                { accessReview: { name: '4' }, cta: { href: '' }, id: '9' },
                { accessReview: { name: '3' }, cta: { href: '' }, id: '10' },
              ],
              id: '8',
              label: 'first eight',
            },
            { accessReview: { name: '2' }, cta: { href: '' }, id: '11' },
          ],
          id: '6',
          label: 'first six',
        },
        { accessReview: { name: '1' }, cta: { href: '' }, id: '5' },
      ]).sort((a, b) => a.name.localeCompare(b.name)),
    ).toEqual([{ name: '1' }, { name: '2' }, { name: '3' }, { name: '4' }, { name: '5' }]);
  });
});
