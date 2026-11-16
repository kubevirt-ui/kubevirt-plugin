import { parseFailedTestGroups } from './parseFailedTestGroups';

describe('parseFailedTestGroups', () => {
  it.each([undefined, null, {}])('should return no groups for %p', (value) => {
    expect(parseFailedTestGroups(value)).toEqual([]);
  });

  it('should group tests by category, parse each name and keep the uncategorized group', () => {
    const result = parseFailedTestGroups({
      '': ['test_a'],
      network: ['test_b', 'test_b'],
      storage: ['[sig-storage] should clone'],
    });

    expect(result.map(({ category }) => category)).toEqual(['', 'network', 'storage']);
    expect(result[1].tests.map(({ key }) => key)).toEqual([
      'failed-network-test_b-0',
      'failed-network-test_b-1',
    ]);
    expect(result[2].tests[0]).toMatchObject({
      description: 'should clone',
      title: '[sig-storage]',
    });
  });

  it.each([
    ['a string', 'test_a'],
    ['a flat list', ['test_a', 'test_b']],
    ['a null category value', { storage: null }],
    ['a null test name', { storage: ['test_a', null] }],
  ])('should not throw and return no groups for %s', (_label, value) => {
    expect(() => parseFailedTestGroups(value as never)).not.toThrow();
    expect(parseFailedTestGroups(value as never)).toEqual([]);
  });
});
