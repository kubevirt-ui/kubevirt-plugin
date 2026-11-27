import {
  getDefaultRunningStrategy,
  RUNSTRATEGY_ALWAYS,
  RUNSTRATEGY_HALTED,
  RUNSTRATEGY_MANUAL,
  RUNSTRATEGY_RERUNONFAILURE,
} from './constants';

describe('getDefaultRunningStrategy', () => {
  it('uses RerunOnFailure when the user has not chosen a value', () => {
    expect(getDefaultRunningStrategy()).toBe(RUNSTRATEGY_RERUNONFAILURE);
    expect(getDefaultRunningStrategy(undefined)).toBe(RUNSTRATEGY_RERUNONFAILURE);
    expect(getDefaultRunningStrategy('')).toBe(RUNSTRATEGY_RERUNONFAILURE);
  });

  it('uses the run strategy the user saved', () => {
    expect(getDefaultRunningStrategy(RUNSTRATEGY_ALWAYS)).toBe(RUNSTRATEGY_ALWAYS);
    expect(getDefaultRunningStrategy(RUNSTRATEGY_HALTED)).toBe(RUNSTRATEGY_HALTED);
    expect(getDefaultRunningStrategy(RUNSTRATEGY_MANUAL)).toBe(RUNSTRATEGY_MANUAL);
    expect(getDefaultRunningStrategy(RUNSTRATEGY_RERUNONFAILURE)).toBe(RUNSTRATEGY_RERUNONFAILURE);
  });

  it('ignores a value that is not a run strategy', () => {
    expect(getDefaultRunningStrategy('Once')).toBe(RUNSTRATEGY_RERUNONFAILURE);
  });
});
