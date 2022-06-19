import { ObjectEnum } from '@kubevirt-utils/utils/ObjectEnum';

type TopConsumerScopeData = {
  dropdownLabel: string;
};

abstract class TopConsumerScopeObjectEnum<T> extends ObjectEnum<T> {
  protected readonly dropdownLabel: string;

  protected constructor(value: T, { dropdownLabel }: TopConsumerScopeData) {
    super(value);
    this.dropdownLabel = dropdownLabel;
  }

  getDropdownLabel = (): string => this.dropdownLabel;
}

export class TopConsumerScope extends TopConsumerScopeObjectEnum<string> {
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

  private static readonly ALL = Object.freeze(
    ObjectEnum.getAllClassEnumProperties<TopConsumerScope>(TopConsumerScope),
  );

  static getAll = () => TopConsumerScope.ALL;

  private static readonly stringMapper = TopConsumerScope.ALL.reduce(
    (accumulator, scope: TopConsumerScope) => ({
      ...accumulator,
      [scope.value]: scope,
    }),
    {},
  );

  private static readonly dropdownLabelMapper = TopConsumerScope.ALL.reduce(
    (accumulator, scope: TopConsumerScope) => ({
      ...accumulator,
      [scope.dropdownLabel]: scope,
    }),
    {},
  );

  static fromString = (source: string): TopConsumerScope => TopConsumerScope.stringMapper[source];

  static fromDropdownLabel = (dropdownLabel: string): TopConsumerScope =>
    TopConsumerScope.dropdownLabelMapper[dropdownLabel];
}
