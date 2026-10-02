import { TimeoutUnits } from './consts';

/**
 * Regression tests for TimeoutUnits enum.
 * Milliseconds has been removed per KubeVirt snapshot API (only h, m, s are supported).
 * SnapshotModal and SnapshotTimeoutFormField rely on this enum for timeout unit options.
 */
describe('snapshots consts', () => {
  const EXPECTED_TIMEOUT_UNITS = {
    Hours: 'h',
    Minutes: 'm',
    Seconds: 's',
  } as const;

  describe('TimeoutUnits', () => {
    it('should expose exactly Hours, Minutes and Seconds', () => {
      const entries = Object.entries(TimeoutUnits);
      expect(entries).toHaveLength(3);
      expect(TimeoutUnits).toEqual(EXPECTED_TIMEOUT_UNITS);
    });

    it('should not include Milliseconds (regression: do not re-add ms)', () => {
      const keys = Object.keys(TimeoutUnits);
      const values = Object.values(TimeoutUnits);

      expect(keys).not.toContain('Milliseconds');
      expect(values).not.toContain('ms');
    });

    it.each(Object.entries(EXPECTED_TIMEOUT_UNITS))(
      'should have %s value compatible with KubeVirt snapshot timeout format (%s)',
      (key, value) => expect(TimeoutUnits[key as keyof typeof TimeoutUnits]).toBe(value),
    );
  });
});
