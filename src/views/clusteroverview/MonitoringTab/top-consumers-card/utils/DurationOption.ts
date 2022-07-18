import DropdownEnum from '@kubevirt-utils/utils/dropdownEnum';
import { ObjectEnum } from '@kubevirt-utils/utils/ObjectEnum';

class DurationOption extends DropdownEnum<string> {
  static readonly FIVE_MIN = new DurationOption('5m', {
    dropdownLabel: 'Last 5 minutes',
  });

  static readonly FIFTEEN_MIN = new DurationOption('15m', {
    dropdownLabel: 'Last 15 minutes',
  });

  static readonly THIRTY_MIN = new DurationOption('30m', {
    dropdownLabel: 'Last 30 minutes',
  });

  static readonly ONE_HOUR = new DurationOption('1h', {
    dropdownLabel: 'Last 1 hour',
  });

  static readonly THREE_HOURS = new DurationOption('3h', {
    dropdownLabel: 'Last 3 hours',
  });

  static readonly SIX_HOURS = new DurationOption('6h', {
    dropdownLabel: 'Last 6 hours',
  });

  static readonly TWELVE_HOURS = new DurationOption('12h', {
    dropdownLabel: 'Last 12 hours',
  });

  static readonly ONE_DAY = new DurationOption('1d', {
    dropdownLabel: 'Last 1 day',
  });

  static readonly TWO_DAYS = new DurationOption('2d', {
    dropdownLabel: 'Last 2 day',
  });

  static readonly ONE_WEEK = new DurationOption('1w', {
    dropdownLabel: 'Last 1 week',
  });

  private static readonly ALL = Object.freeze(
    ObjectEnum.getAllClassEnumProperties<DurationOption>(DurationOption),
  );

  static getAll = () => DurationOption.ALL;

  private static readonly stringMapper = DurationOption.ALL.reduce(
    (accumulator, durationOption: DurationOption) => ({
      ...accumulator,
      [durationOption.value]: durationOption,
    }),
    {},
  );

  private static readonly dropdownLabelMapper = DurationOption.ALL.reduce(
    (accumulator, durationOption: DurationOption) => ({
      ...accumulator,
      [durationOption.dropdownLabel]: durationOption,
    }),
    {},
  );

  static fromString = (source: string): DurationOption => DurationOption.stringMapper[source];

  static fromDropdownLabel = (dropdownLabel: string): DurationOption =>
    DurationOption.dropdownLabelMapper[dropdownLabel];
}

export default DurationOption;
