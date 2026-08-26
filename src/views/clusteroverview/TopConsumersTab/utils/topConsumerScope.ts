import DropdownEnum from '@kubevirt-utils/utils/dropdownEnum';

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
  static readonly NODE = new TopConsumerScope('NODE', {
    dropdownLabel: 'Node',
  });

  static readonly PROJECT = new TopConsumerScope('PROJECT', {
    dropdownLabel: 'Project',
  });

  static readonly vm = new TopConsumerScope('VM', {
    dropdownLabel: 'VM',
  });

  static fromDropdownLabel(dropdownLabel: string): TopConsumerScope {
    return scopeDropdownLabelMapper[dropdownLabel];
  }

  static fromString(source: string): TopConsumerScope {
    return scopeStringMapper[source];
  }

  static getAll(isAllNamespaces?: boolean): readonly TopConsumerScope[] {
    if (isAllNamespaces || isAllNamespaces === undefined) {
      return allScopes;
    }
    return [TopConsumerScope.vm, TopConsumerScope.NODE];
  }
}

const allScopes: readonly TopConsumerScope[] = Object.freeze([
  TopConsumerScope.NODE,
  TopConsumerScope.PROJECT,
  TopConsumerScope.vm,
]);

const scopeDropdownLabelMapper: Record<string, TopConsumerScope> = Object.fromEntries(
  allScopes.map((scope) => [scope.getDropdownLabel(), scope]),
) as Record<string, TopConsumerScope>;

const scopeStringMapper: Record<string, TopConsumerScope> = Object.fromEntries(
  allScopes.map((scope) => [scope.getValue(), scope]),
) as Record<string, TopConsumerScope>;
