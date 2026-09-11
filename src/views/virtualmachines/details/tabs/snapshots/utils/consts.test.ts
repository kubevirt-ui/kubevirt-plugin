import { DeadlineUnits } from './consts';

/**
 * Regression tests for DeadlineUnits enum.
 * Milliseconds has been removed per KubeVirt snapshot API (only h, m, s are supported).
 * SnapshotModal and SnapshotDeadlineFormField rely on this enum for deadline unit options.
 */
describe('snapshots consts', () => {
  const EXPECTED_DEADLINE_UNITS = {
    Hours: 'h',
    Minutes: 'm',
    Seconds: 's',
  } as const;

  describe('DeadlineUnits', () => {
    it('should expose exactly Hours, Minutes and Seconds', () => {
      const entries = Object.entries(DeadlineUnits);
      expect(entries).toHaveLength(3);
      expect(DeadlineUnits).toEqual(EXPECTED_DEADLINE_UNITS);
    });

    it('should not include Milliseconds (regression: do not re-add ms)', () => {
      const keys = Object.keys(DeadlineUnits);
      const values = Object.values(DeadlineUnits);

      expect(keys).not.toContain('Milliseconds');
      expect(values).not.toContain('ms');
    });

    it.each(Object.entries(EXPECTED_DEADLINE_UNITS))(
      'should have %s value compatible with KubeVirt snapshot deadline format (%s)',
      (key, value) => expect(DeadlineUnits[key as keyof typeof DeadlineUnits]).toBe(value),
    );
  });
});
