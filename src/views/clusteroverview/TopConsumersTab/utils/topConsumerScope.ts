import DropdownEnum from '@kubevirt-utils/utils/dropdownEnum';
import { ObjectEnum } from '@kubevirt-utils/utils/ObjectEnum';

type TopConsumerScopeData = {
  dropdownLabel: string;
};

abstract class TopConsumerScopeObjectEnum<T> extends DropdownEnum<T> {
  protected readonly dropdownLabel: string;

  protected constructor(value: T, { dropdownLabel }: TopConsumerScopeData) {
    super(value, { dropdownLabel });
    this.dropdownLabel = dropdownLabel;
  }
}

export class TopConsumerScope extends TopConsumerScopeObjectEnum<string> {
  private static readonly ALL = Object.freeze(
    ObjectEnum.getAllClassEnumProperties<TopConsumerScope>(TopConsumerScope),
  );

  private static readonly dropdownLabelMapper = TopConsumerScope.ALL.reduce(
    (accumulator, scope: TopConsumerScope) => ({
      ...accumulator,
      [scope.dropdownLabel]: scope,
    }),
    {},
  );

  static fromDropdownLabel = (dropdownLabel: string): TopConsumerScope =>
    TopConsumerScope.dropdownLabelMapper[dropdownLabel];

  static fromString = (source: string): TopConsumerScope => TopConsumerScope.stringMapper[source];

  static getAll = () => TopConsumerScope.ALL;

  static readonly NODE = new TopConsumerScope('NODE', {
    dropdownLabel: 'Node',
  });

  static readonly PROJECT = new TopConsumerScope('PROJECT', {
    dropdownLabel: 'Project',
  });

  private static readonly stringMapper = TopConsumerScope.ALL.reduce(
    (accumulator, scope: TopConsumerScope) => ({
      ...accumulator,
      [scope.value]: scope,
    }),
    {},
  );

  static readonly VM = new TopConsumerScope('VM', {
    dropdownLabel: 'VM',
  });
}
