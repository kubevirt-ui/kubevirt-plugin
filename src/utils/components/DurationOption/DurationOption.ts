import DropdownEnum from '@kubevirt-utils/utils/dropdownEnum';
import { ObjectEnum } from '@kubevirt-utils/utils/ObjectEnum';

export const ONE_SECOND = 1000;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const FIVE_MIN = 5 * ONE_MINUTE;
export const FIFTEEN_MIN = 3 * FIVE_MIN;
export const THIRTY_MIN = 2 * FIFTEEN_MIN;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const THREE_HOURS = 3 * ONE_HOUR;
export const FOUR_HOURS = 4 * ONE_HOUR;
export const SIX_HOURS = 2 * THREE_HOURS;
export const TWELVE_HOURS = 2 * SIX_HOURS;
export const ONE_DAY = 2 * TWELVE_HOURS;
export const TWO_DAYS = 2 * ONE_DAY;
export const ONE_WEEK = 7 * ONE_DAY;

const mapperDuration = {
  '12h': TWELVE_HOURS,
  '15m': FIFTEEN_MIN,
  '1d': ONE_DAY,
  '1h': ONE_HOUR,
  '1w': ONE_WEEK,
  '2d': TWO_DAYS,
  '30m': THIRTY_MIN,
  '3h': THREE_HOURS,
  '4h': FOUR_HOURS,
  '5m': FIVE_MIN,
  '6h': SIX_HOURS,
};

const getDurationMilliseconds = (duration) => mapperDuration?.[duration] || mapperDuration?.['5m'];

class DurationOption extends DropdownEnum<string> {
  static readonly FIFTEEN_MIN = new DurationOption('15m', {
    dropdownLabel: 'Last 15 minutes',
  });

  static readonly FIVE_MIN = new DurationOption('5m', {
    dropdownLabel: 'Last 5 minutes',
  });

  static readonly ONE_DAY = new DurationOption('1d', {
    dropdownLabel: 'Last 1 day',
  });

  static readonly ONE_HOUR = new DurationOption('1h', {
    dropdownLabel: 'Last 1 hour',
  });

  static readonly ONE_WEEK = new DurationOption('1w', {
    dropdownLabel: 'Last 1 week',
  });

  static readonly SIX_HOURS = new DurationOption('6h', {
    dropdownLabel: 'Last 6 hours',
  });

  static readonly THIRTY_MIN = new DurationOption('30m', {
    dropdownLabel: 'Last 30 minutes',
  });

  static readonly THREE_HOURS = new DurationOption('3h', {
    dropdownLabel: 'Last 3 hours',
  });

  static readonly TWELVE_HOURS = new DurationOption('12h', {
    dropdownLabel: 'Last 12 hours',
  });

  static readonly TWO_DAYS = new DurationOption('2d', {
    dropdownLabel: 'Last 2 day',
  });

  private static readonly all = Object.freeze(
    ObjectEnum.getAllClassEnumProperties<DurationOption>(DurationOption),
  );
  private static readonly dropdownLabelMapper = DurationOption.all.reduce(
    (accumulator, durationOption: DurationOption) => ({
      ...accumulator,
      [durationOption.dropdownLabel]: durationOption,
    }),
    {},
  );
  static fromDropdownLabel = (dropdownLabel: string): DurationOption =>
    DurationOption.dropdownLabelMapper[dropdownLabel];

  static fromString = (source: string): DurationOption => DurationOption.stringMapper[source];
  static getAll = () => DurationOption.all;
  static getMilliseconds = (duration: string): number =>
    DurationOption.stringMapper?.[duration]?.millisecondsTime;
  private static readonly stringMapper = DurationOption.all.reduce(
    (accumulator, durationOption: DurationOption) => ({
      ...accumulator,
      [durationOption.value]: durationOption,
    }),
    {},
  );
  protected readonly millisecondsTime: number;
  constructor(value: string, { dropdownLabel }) {
    super(value, { dropdownLabel });
    this.millisecondsTime = getDurationMilliseconds(value);
  }
}

export default DurationOption;
