import DropdownEnum from '@kubevirt-utils/utils/dropdownEnum';
import { ObjectEnum } from '@kubevirt-utils/utils/ObjectEnum';

class DurationOption extends DropdownEnum<string> {
  static readonly FIVE_MIN = new DurationOption('5m', {
    dropdownLabel: 'Last 5 minutes',
  });

  static readonly ONE_HOUR = new DurationOption('1h', {
    dropdownLabel: 'Last 1 hour',
  });

  static readonly FOUR_HOURS = new DurationOption('4h', {
    dropdownLabel: 'Last 4 hours',
  });

  static readonly ONE_DAY = new DurationOption('1d', {
    dropdownLabel: 'Last 1 day',
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
