import { ObjectEnum } from '@kubevirt-utils/utils/ObjectEnum';

export type DropdownProps = {
  dropdownLabel: string;
};

abstract class DropdownEnum<T> extends ObjectEnum<T> {
  protected readonly dropdownLabel: string;

  getDropdownLabel = (): string => this.dropdownLabel;

  protected constructor(value: T, { dropdownLabel }) {
    super(value);
    this.dropdownLabel = dropdownLabel;
  }
}

export default DropdownEnum;
