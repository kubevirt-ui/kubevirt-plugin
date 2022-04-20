import { ObjectEnum } from '@kubevirt-utils/utils/ObjectEnum';

type TopConsumerScopeData = {
  dropdownLabel: string;
};

export class TopConsumerScope extends ObjectEnum<string> {
  static readonly PROJECT = new TopConsumerScope('PROJECT', {
    // t('Project')
    dropdownLabel: 'Project',
  });

  static readonly VM = new TopConsumerScope('VM', {
    // t('VM')
    dropdownLabel: 'VM',
  });

  static readonly NODE = new TopConsumerScope('NODE', {
    // t('Node')
    dropdownLabel: 'Node',
  });

  private readonly dropdownLabel: string;

  protected constructor(value: string, { dropdownLabel }: TopConsumerScopeData) {
    super(value);
    this.dropdownLabel = dropdownLabel;
  }

  private static readonly ALL = Object.freeze(
    ObjectEnum.getAllClassEnumProperties<TopConsumerScope>(TopConsumerScope),
  );

  static getAll = () => TopConsumerScope.ALL;

  private static readonly dropdownLabelMapper = TopConsumerScope.ALL.reduce(
    (accumulator, metric: TopConsumerScope) => ({
      ...accumulator,
      [metric.dropdownLabel.replace('', '')]: metric,
    }),
    {},
  );

  getDropdownLabel = (): string => this.dropdownLabel;

  toString = (): string => this.dropdownLabel || super.toString();

  static fromDropdownLabel = (dropdownLabel: string): TopConsumerScope =>
    TopConsumerScope.dropdownLabelMapper[dropdownLabel];
}
