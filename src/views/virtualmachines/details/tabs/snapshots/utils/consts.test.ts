import { deadlineUnits } from './consts';

/**
 * Regression tests for deadlineUnits enum.
 * Milliseconds has been removed per KubeVirt snapshot API (only h, m, s are supported).
 * SnapshotModal and SnapshotDeadlineFormField rely on this enum for deadline unit options.
 */
describe('snapshots consts', () => {
  const EXPECTED_DEADLINE_UNITS = {
    Hours: 'h',
    Minutes: 'm',
    Seconds: 's',
  } as const;

  describe('deadlineUnits', () => {
    it('should expose exactly Hours, Minutes and Seconds', () => {
      const entries = Object.entries(deadlineUnits);
      expect(entries).toHaveLength(3);
      expect(deadlineUnits).toEqual(EXPECTED_DEADLINE_UNITS);
    });

    it('should not include Milliseconds (regression: do not re-add ms)', () => {
      const keys = Object.keys(deadlineUnits);
      const values = Object.values(deadlineUnits);

      expect(keys).not.toContain('Milliseconds');
      expect(values).not.toContain('ms');
    });

    it.each(Object.entries(EXPECTED_DEADLINE_UNITS))(
      'should have %s value compatible with KubeVirt snapshot deadline format (%s)',
      (key, value) => expect(deadlineUnits[key as keyof typeof deadlineUnits]).toBe(value),
    );
  });
});
