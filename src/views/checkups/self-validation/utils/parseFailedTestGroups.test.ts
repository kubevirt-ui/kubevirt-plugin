import { parseFailedTestGroups } from './parseFailedTestGroups';

describe('parseFailedTestGroups', () => {
  it('should return no groups for no groups', () => {
    expect(parseFailedTestGroups([])).toEqual([]);
  });

  it('should keep the category and parse each test into title and description', () => {
    const result = parseFailedTestGroups([
      { category: 'storage', tests: ['[sig-storage] should clone', 'test_plain_name'] },
    ]);

    expect(result).toEqual([
      {
        category: 'storage',
        tests: [
          {
            description: 'should clone',
            key: 'failed-storage-[sig-storage] should clone-0',
            title: '[sig-storage]',
          },
          {
            description: 'test_plain_name',
            key: 'failed-storage-test_plain_name-0',
            title: '',
          },
        ],
      },
    ]);
  });

  it('should keep the empty (uncategorized) category', () => {
    const [group] = parseFailedTestGroups([{ category: '', tests: ['test_a'] }]);

    expect(group.category).toBe('');
    expect(group.tests[0].key).toBe('failed--test_a-0');
  });

  it('should give duplicate test names in the same category unique keys', () => {
    const [group] = parseFailedTestGroups([{ category: 'network', tests: ['test_a', 'test_a'] }]);
    const keys = group.tests.map(({ key }) => key);

    expect(keys).toEqual(['failed-network-test_a-0', 'failed-network-test_a-1']);
    expect(new Set(keys).size).toBe(2);
  });

  it('should restart the occurrence index for each category', () => {
    const result = parseFailedTestGroups([
      { category: 'network', tests: ['test_a'] },
      { category: 'storage', tests: ['test_a'] },
    ]);

    expect(result.map(({ tests }) => tests[0].key)).toEqual([
      'failed-network-test_a-0',
      'failed-storage-test_a-0',
    ]);
  });

  it('should not mutate its input', () => {
    const groups = Object.freeze([
      Object.freeze({
        category: 'storage',
        tests: Object.freeze(['test_a', 'test_a']) as string[],
      }),
    ]) as { category: string; tests: string[] }[];

    expect(() => parseFailedTestGroups(groups)).not.toThrow();
    expect(groups[0].tests).toEqual(['test_a', 'test_a']);
  });
});
